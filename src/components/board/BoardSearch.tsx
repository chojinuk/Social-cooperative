import type { BoardType } from "@/db/schema";
import { Icon } from "@/components/ui/Icon";

/** 게시판 하단 검색 (원본 #bo_sch) — 제출하면 /search?board=…&q=… 로 이동 (JS 없이도 동작하는 GET 폼) */
export function BoardSearch({ board, q = "" }: { board: BoardType | ""; q?: string }) {
  return (
    <fieldset id="bo_sch">
      <legend className="sound_only">게시물 검색</legend>
      <form action="/search" method="get" role="search">
        <label htmlFor="sch_board" className="sound_only">
          검색 대상
        </label>
        <select name="board" id="sch_board" defaultValue={board}>
          <option value="">전체</option>
          <option value="notice">공지사항</option>
          <option value="story">조합이야기</option>
        </select>
        <label htmlFor="stx" className="sound_only">
          검색어
        </label>
        <input type="search" name="q" id="stx" defaultValue={q} required minLength={2} maxLength={20} className="sch_input" placeholder="검색어를 입력해주세요" />
        <button type="submit" className="sch_btn">
          <Icon name="search" />
          <span className="sound_only">검색</span>
        </button>
      </form>
    </fieldset>
  );
}
