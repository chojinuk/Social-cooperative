"use server";

import { eq, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { BOARD_TYPES, inquiries, postFiles, posts, type BoardType } from "@/db/schema";
import { authConfigProblems, endSession, isLockedOut, requireAdmin, startSession, verifyCredentials } from "@/lib/auth";
import { firstImageSrc, makeExcerpt, sanitizePostHtml } from "@/lib/html";
import { deleteObject, keyFromUrl, resolveUpload } from "@/lib/storage";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

// ───────── 로그인 ─────────
export async function loginAction(
  _prev: { error?: string; id?: string } | null,
  formData: FormData,
): Promise<{ error?: string; id?: string }> {
  const problems = authConfigProblems();
  if (problems.length) return { error: `관리자 환경변수가 설정되지 않았습니다: ${problems.join(", ")}` };
  if (await isLockedOut()) return { error: "로그인 시도가 너무 많습니다. 10분 후 다시 시도해 주세요." };

  const id = String(formData.get("id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!id || !password) return { error: "아이디와 비밀번호를 입력해 주세요.", id };
  if (!(await verifyCredentials(id, password))) return { error: "아이디 또는 비밀번호가 올바르지 않습니다.", id };

  await startSession();
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

// ───────── 게시글 ─────────
const imageKeys = (html: string) =>
  new Set([...html.matchAll(/<img[^>]*\bsrc="([^"]+)"/g)].map((m) => keyFromUrl(m[1])).filter((k): k is string => !!k));

/** 첨부파일: 새로 올린 파일은 key+url, 이미 있던 파일은 id 로 지정 */
export type AttachmentRef = { id?: number; key?: string; url?: string; fileName: string; size: number };

export async function savePost(input: {
  id?: number;
  boardType: BoardType;
  title: string;
  content: string;
  isNotice: boolean;
  isPublished: boolean;
  files: AttachmentRef[];
}): Promise<ActionResult<{ id: number }>> {
  await requireAdmin();
  const title = input.title.trim();
  if (!BOARD_TYPES.includes(input.boardType)) return { ok: false, error: "게시판을 선택해 주세요." };
  if (!title) return { ok: false, error: "제목을 입력해 주세요." };
  if (title.length > 200) return { ok: false, error: "제목은 200자 이내로 입력해 주세요." };

  const content = sanitizePostHtml(input.content);
  if (!content.replace(/<[^>]+>/g, "").trim() && !content.includes("<img")) {
    return { ok: false, error: "내용을 입력해 주세요." };
  }
  const thumbnailUrl = firstImageSrc(content);
  if (input.boardType === "story" && !thumbnailUrl) {
    return { ok: false, error: "조합이야기는 본문에 사진을 한 장 이상 넣어 주세요. (첫 사진이 목록 썸네일이 됩니다)" };
  }
  const values = {
    boardType: input.boardType,
    title,
    content,
    excerpt: makeExcerpt(content, 160),
    thumbnailUrl,
    isNotice: input.boardType === "notice" && input.isNotice,
    isPublished: input.isPublished,
  };

  const db = await getDb();
  let id = input.id;
  let oldFiles: (typeof postFiles.$inferSelect)[] = [];
  if (id) {
    const [old] = await db.select({ content: posts.content }).from(posts).where(eq(posts.id, id));
    if (!old) return { ok: false, error: "글을 찾을 수 없습니다." };
    oldFiles = await db.select().from(postFiles).where(eq(postFiles.postId, id));
    await db.update(posts).set({ ...values, updatedAt: new Date() }).where(eq(posts.id, id));
    // 본문에서 빠진 이미지는 저장소에서도 정리
    const kept = imageKeys(content);
    await Promise.all([...imageKeys(old.content)].filter((k) => !kept.has(k)).map(deleteObject));
  } else {
    const [row] = await db.insert(posts).values(values).returning({ id: posts.id });
    id = row.id;
  }

  // 첨부파일: 기존 파일은 이 글에 실제로 있던 것만, 새 파일은 안전한 키(files/…)만 허용 (neon-http 는 트랜잭션이 없어 순차 실행)
  const keepIds = new Set<number>();
  const added: (typeof postFiles.$inferInsert)[] = [];
  for (const [i, f] of input.files.slice(0, 10).entries()) {
    const fileName = String(f.fileName ?? "").trim().slice(0, 200) || "첨부파일";
    if (f.id && oldFiles.some((o) => o.id === f.id)) {
      keepIds.add(f.id);
      await db.update(postFiles).set({ sortOrder: i, fileName }).where(eq(postFiles.id, f.id));
      continue;
    }
    const stored = typeof f.key === "string" && f.key.startsWith("files/") ? resolveUpload(f) : null;
    if (stored) added.push({ postId: id, fileName, url: stored.url, storageKey: stored.storageKey, size: Math.max(0, Math.round(f.size) || 0), sortOrder: i });
  }
  const removed = oldFiles.filter((o) => !keepIds.has(o.id));
  if (removed.length) {
    await db.delete(postFiles).where(inArray(postFiles.id, removed.map((r) => r.id)));
    await Promise.all(removed.map((r) => deleteObject(r.storageKey)));
  }
  if (added.length) await db.insert(postFiles).values(added);

  updateTag("posts");
  return { ok: true, data: { id } };
}

export async function setPostPublished(id: number, isPublished: boolean): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  await db.update(posts).set({ isPublished }).where(eq(posts.id, id));
  updateTag("posts");
  return { ok: true };
}

export async function deletePost(id: number): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  const files = await db.select({ key: postFiles.storageKey }).from(postFiles).where(eq(postFiles.postId, id));
  // post_files 행은 ON DELETE CASCADE 로 함께 삭제됨
  const [row] = await db.delete(posts).where(eq(posts.id, id)).returning({ content: posts.content });
  if (row) await Promise.all([...imageKeys(row.content), ...files.map((f) => f.key)].map((k) => deleteObject(k)));
  updateTag("posts");
  return { ok: true };
}

// ───────── 상담 및 제안 ─────────
export async function setInquiryRead(id: number, isRead: boolean): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  await db.update(inquiries).set({ isRead }).where(eq(inquiries.id, id));
  return { ok: true };
}

export async function deleteInquiry(id: number): Promise<ActionResult> {
  await requireAdmin();
  const db = await getDb();
  await db.delete(inquiries).where(eq(inquiries.id, id));
  return { ok: true };
}
