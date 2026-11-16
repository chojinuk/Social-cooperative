import Link from "next/link";
import { adminRecentPosts, adminStats } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { boardLabel, formatDate } from "@/lib/format";
import { isBlobConfigured } from "@/lib/storage";

// 관리자 화면: 매 요청 서버 렌더링 (DB 최신값 · 로그인 확인)
export const instant = false;

export const metadata = { title: "대시보드" };

export default async function Dashboard() {
  await requireAdmin();
  const [stats, recent] = await Promise.all([adminStats(), adminRecentPosts(6)]);
  const cards = [
    { label: "공지사항", value: stats.notice, href: "/admin/posts?board=notice" },
    { label: "조합이야기", value: stats.story, href: "/admin/posts?board=story" },
    { label: "읽지 않은 상담·제안", value: stats.unreadInquiries, href: "/admin/inquiries" },
  ];
  const warnings = [
    !process.env.DATABASE_URL && !process.env.POSTGRES_URL && "DATABASE_URL 미설정 — 로컬 개발용 내장 DB를 사용 중입니다.",
    !isBlobConfigured() && "Vercel Blob 미설정 — 업로드 파일이 로컬(.data/uploads)에 저장됩니다.",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-ink">대시보드</h1>
          <p className="mt-1 text-muted">글을 등록하면 홈페이지에 바로 반영됩니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/posts/new?board=notice" className="rounded-md bg-theme px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90">
            + 공지 쓰기
          </Link>
          <Link href="/admin/posts/new?board=story" className="rounded-md border border-line bg-white px-5 py-2.5 text-[14px] font-bold text-ink hover:border-theme">
            + 조합이야기 쓰기
          </Link>
        </div>
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-md bg-amber-50 px-5 py-4 text-[13.5px] text-[#7a5b00]">
          {warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      )}

      <ul className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block rounded-md border border-line bg-white p-6 hover:border-theme">
              <p className="text-[14px] text-muted">{c.label}</p>
              <p className="mt-2 text-[32px] font-bold text-ink">{c.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-md border border-line bg-white p-6">
        <h2 className="mb-4 text-[18px] font-bold text-ink">최근 게시글</h2>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-muted">아직 게시글이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3 text-[14.5px]">
                <span className="shrink-0 rounded-md bg-surface px-2.5 py-1 text-[12px] text-muted">{boardLabel[p.boardType]}</span>
                <Link href={`/admin/posts/${p.id}/edit`} className="min-w-0 flex-1 truncate text-ink hover:text-theme">
                  {p.title}
                </Link>
                {!p.isPublished && <span className="shrink-0 text-[12px] text-hot">비공개</span>}
                <span className="shrink-0 text-muted">조회 {p.views}</span>
                <span className="hidden shrink-0 text-muted sm:inline">{formatDate(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
