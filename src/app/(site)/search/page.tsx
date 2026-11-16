import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BoardSearch } from "@/components/board/BoardSearch";
import { SubPage } from "@/components/layout/SubPage";
import { BOARD_TYPES, type BoardType } from "@/db/schema";
import { searchPosts } from "@/lib/data";
import { boardLabel, formatDate } from "@/lib/format";

// 검색 결과는 검색엔진에 노출하지 않음 (robots.txt 에서도 /search 차단)
export const metadata: Metadata = {
  title: "검색",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function Page({ searchParams }: PageProps<"/search">) {
  return (
    <SubPage path="/search" title="검색">
      <Suspense fallback={<p className="sch_result_info">검색 중…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </SubPage>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 40);
  const board = BOARD_TYPES.includes(sp.board as BoardType) ? (sp.board as BoardType) : null;
  const results = q.length >= 2 ? await searchPosts(q, board) : [];

  return (
    <div className="WCMSSwr">
      {q.length < 2 ? (
        <p className="sch_result_info">검색어를 두 글자 이상 입력해 주세요.</p>
      ) : (
        <p className="sch_result_info" role="status">
          <strong>“{q}”</strong> {board ? `${boardLabel[board]}에서 ` : ""}검색 결과 <strong>{results.length}</strong>건
        </p>
      )}
      {results.length > 0 && (
        <ul className="sch_result_list">
          {results.map((p) => (
            <li key={p.id}>
              <span className="sch_board">{boardLabel[p.boardType]}</span>
              <Link href={`/news/${p.boardType}/${p.id}`}>{p.title}</Link>
              <span className="sch_date">{formatDate(p.createdAt)}</span>
              {p.excerpt && <p>{p.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
      <div className="bo_bottom" style={{ marginTop: 30 }}>
        <BoardSearch board={board ?? ""} q={q} />
      </div>
    </div>
  );
}
