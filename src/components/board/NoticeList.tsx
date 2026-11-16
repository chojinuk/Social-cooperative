import Link from "next/link";
import type { PostSummary } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/**
 * 공지형 목록 (원본 basic 스킨 .likeTbl): 번호 · 제목 · 작성자 · 조회 · 날짜
 * 고정글은 매 페이지 맨 위에 확성기 아이콘으로, 800px 이하에서는 한 줄 블록으로 바뀜
 */
export function NoticeList({ base, pinned, items, startNo }: { base: string; pinned: PostSummary[]; items: PostSummary[]; startNo: number }) {
  const row = (p: PostSummary, no: number | null) => (
    <li key={`${no === null ? "n" : "r"}-${p.id}`} className={`likeTblTd${no === null ? " bo_notice" : ""}`}>
      <div className="mvInlineN td_num2">
        {no === null ? (
          <strong className="notice_icon">
            <Icon name="bullhorn" />
            <span className="sound_only">공지</span>
          </strong>
        ) : (
          no
        )}
      </div>
      <div className="td_subject">
        <Link href={`${base}/${p.id}`}>
          {p.title}
          {p.fileCount > 0 && (
            <em>
              <span className="fico" title="첨부파일">
                <Icon name="download" />
              </span>
            </em>
          )}
        </Link>
      </div>
      <div className="mvInlinev td_name">{p.author}</div>
      <div className="mvInlinev td_num">
        <Icon name="eye" />
        <span className="sound_only">조회</span> {p.views}
      </div>
      <div className="mvInlinev td_datetime">
        <Icon name="clock" />
        <span className="sound_only">작성일</span>
        <time dateTime={p.createdAt}>{formatShortDate(p.createdAt)}</time>
      </div>
    </li>
  );

  return (
    <div className="likeTbl">
      <ul>
        <li className="likeTblTh" aria-hidden="true">
          <div className="mvInlineN">번호</div>
          <div>제목</div>
          <div className="mvInlineN">작성자</div>
          <div className="mvInlineN td_num">조회</div>
          <div className="mvInlineN td_datetime">날짜</div>
        </li>
        {pinned.map((p) => row(p, null))}
        {items.map((p, i) => row(p, startNo - i))}
      </ul>
      {pinned.length + items.length === 0 && (
        <div className="noDataArea">
          <b>
            <Icon name="file" />
          </b>
          게시물이 없습니다.
        </div>
      )}
    </div>
  );
}
