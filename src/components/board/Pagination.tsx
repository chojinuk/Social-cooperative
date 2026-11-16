import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/**
 * 원본 .pg_wrap 모양의 페이지 번호 (30px 둥근 칸, 현재 페이지 진회색).
 * 주소는 경로 기반(/news/notice, /news/notice/page/2 …)이라 모든 페이지가 정적 HTML 로 수집된다.
 */
export function Pagination({ base, page, totalPages }: { base: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}/page/${n}`);
  const start = Math.max(1, Math.min(page - 4, totalPages - 9));
  const pages = Array.from({ length: Math.min(10, totalPages) }, (_, i) => start + i);
  return (
    <nav className="pg_wrap" aria-label="페이지 이동">
      <span className="pg">
        {page > 1 && (
          <>
            <Link href={href(1)} className="pg_page pg_arrow" aria-label="처음 페이지">
              <Icon name="angleLeft" />
              <Icon name="angleLeft" />
            </Link>
            <Link href={href(page - 1)} className="pg_page pg_arrow" rel="prev" aria-label="이전 페이지">
              <Icon name="angleLeft" />
            </Link>
          </>
        )}
        {pages.map((n) =>
          n === page ? (
            <strong key={n} className="pg_current" aria-current="page">
              {n}
            </strong>
          ) : (
            <Link key={n} href={href(n)} className="pg_page">
              {n}
              <span className="sound_only">페이지</span>
            </Link>
          ),
        )}
        {page < totalPages && (
          <>
            <Link href={href(page + 1)} className="pg_page pg_arrow" rel="next" aria-label="다음 페이지">
              <Icon name="angleRight" />
            </Link>
            <Link href={href(totalPages)} className="pg_page pg_arrow" aria-label="맨끝 페이지">
              <Icon name="angleRight" />
              <Icon name="angleRight" />
            </Link>
          </>
        )}
      </span>
    </nav>
  );
}
