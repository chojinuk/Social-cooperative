"use server";

import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { inquiries, posts } from "@/db/schema";

export async function incrementViews(id: number) {
  if (!Number.isInteger(id) || id <= 0) return;
  const db = await getDb();
  await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, id));
}

// ───────── 상담 및 제안 (비회원 작성 · 관리자만 열람) ─────────
export type InquiryState = { ok?: boolean; error?: string; values?: Record<string, string> } | null;

// IP당 1시간에 5건 (메모리 기준 — 서버 인스턴스마다 따로 셈)
const sent = new Map<string, number[]>();
const WINDOW = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const values = { name: get("name"), email: get("email"), phone: get("phone"), subject: get("subject"), message: get("message") };

  // 자동 등록 방지: 사람에게 보이지 않는 칸(website)이 채워졌거나 3초 안에 제출되면 성공한 척하고 버림
  const startedAt = Number(get("t"));
  if (get("website") || !startedAt || Date.now() - startedAt < 3000) return { ok: true };

  if (!values.name) return { error: "이름을 입력해 주세요.", values };
  if (!values.subject) return { error: "제목을 입력해 주세요.", values };
  if (!values.message) return { error: "내용을 입력해 주세요.", values };
  if (!values.email && !values.phone) return { error: "답변 받을 이메일이나 연락처 중 하나는 입력해 주세요.", values };
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { error: "이메일 형식을 확인해 주세요.", values };
  if (formData.get("agree") !== "on") return { error: "개인정보 수집 및 이용에 동의해 주세요.", values };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX_PER_WINDOW) return { error: "잠시 후 다시 시도해 주세요. (1시간에 5건까지 보낼 수 있습니다)", values };

  const db = await getDb();
  await db.insert(inquiries).values({
    name: values.name.slice(0, 50),
    email: values.email.slice(0, 120),
    phone: values.phone.slice(0, 40),
    subject: values.subject.slice(0, 200),
    message: values.message.slice(0, 5000),
  });
  sent.set(ip, [...recent, now]);
  return { ok: true };
}
