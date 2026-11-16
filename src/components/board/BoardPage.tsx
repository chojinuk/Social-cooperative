import { notFound } from "next/navigation";
import { SubPage } from "@/components/layout/SubPage";
import type { BoardType } from "@/db/schema";
import { getPostsPage, POSTS_PER_PAGE } from "@/lib/data";
import { boardLabel } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { BoardSearch } from "./BoardSearch";
import { NoticeList } from "./NoticeList";
import { Pagination } from "./Pagination";
import { StoryGallery } from "./StoryGallery";

/** 게시판 목록 페이지 공통 (1페이지 · /page/N 이 같이 사용) */
export async function BoardPage({ board, page }: { board: BoardType; page: number }) {
  const data = await getPostsPage(board, page);
  if (page > data.totalPages) notFound();
  const base = `/news/${board}`;
  const path = page === 1 ? base : `${base}/page/${page}`;

  return (
    <SubPage path={path} title={boardLabel[board]}>
      <div id="bo_list">
        <div id="bo_btn_top">
          <div id="bo_list_total">
            <span>
              <Icon name="file" /> Total {data.total} /
            </span>{" "}
            {page} page
          </div>
        </div>
        {board === "notice" ? (
          <NoticeList base={base} pinned={page === 1 ? data.pinned : []} items={data.items} startNo={data.total - (page - 1) * POSTS_PER_PAGE} />
        ) : (
          <StoryGallery base={base} items={data.items} />
        )}
        <div className="bo_bottom">
          <BoardSearch board={board} />
        </div>
        <Pagination base={base} page={page} totalPages={data.totalPages} />
      </div>
    </SubPage>
  );
}
