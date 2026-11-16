import type { BoardType } from "@/db/schema";

const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function parts(iso: string | Date) {
  const p = fmt.formatToParts(typeof iso === "string" ? new Date(iso) : iso);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour").replace(/^24$/, "00"), min: get("minute") };
}

/** 2026-11-04 (메인 최신글) */
export function formatDate(iso: string | Date) {
  const { y, m, d } = parts(iso);
  return `${y}-${m}-${d}`;
}

/** 11-04 (게시판 목록 날짜 칸) */
export function formatShortDate(iso: string | Date) {
  const { m, d } = parts(iso);
  return `${m}-${d}`;
}

/** 26-11-04 18:14 (게시글 상세) */
export function formatDateTime(iso: string | Date) {
  const { y, m, d, h, min } = parts(iso);
  return `${y.slice(2)}-${m}-${d} ${h}:${min}`;
}

/** 188.6K (첨부파일 크기) */
export function formatBytes(n: number) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}K`;
  return `${(n / 1024 / 1024).toFixed(1)}M`;
}

export const boardLabel: Record<BoardType, string> = { notice: "공지사항", story: "조합이야기" };

export const boardDescription: Record<BoardType, string> = {
  notice: "총회·이사회 공고, 모집 안내 등 조합의 공지사항입니다.",
  story: "조합과 마을의 활동 소식을 사진으로 전합니다.",
};
