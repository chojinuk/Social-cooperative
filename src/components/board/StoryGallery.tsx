import Link from "next/link";
import type { PostSummary } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

/** 사진형 목록 (원본 gallery 스킨 #bo_gall): 4열 → 800px 3열 → 680px 2열, 마우스를 올리면 어두워지며 조회·날짜 표시 */
export function StoryGallery({ base, items }: { base: string; items: PostSummary[] }) {
  if (!items.length) {
    return (
      <div className="noDataArea">
        <b>
          <Icon name="file" />
        </b>
        게시물이 없습니다.
      </div>
    );
  }
  return (
    <div id="bo_gall">
      <ul id="gall_ul">
        {items.map((p) => (
          <li key={p.id}>
            <div className="gall_box">
              <div className="gall_boxa">
                <Link href={`${base}/${p.id}`} tabIndex={-1} aria-hidden="true">
                  <span className="imgAr">
                    {p.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- 업로드 원본(WebP)·자리표시 SVG 를 그대로 사용
                      <img src={p.thumbnailUrl} alt="" width={202} height={150} loading="lazy" />
                    )}
                  </span>
                </Link>
                <span className="gall_info">
                  <Icon name="eye" /> {p.views}
                  <strong className="gall_date">
                    <Icon name="clock" /> {formatShortDate(p.createdAt)}
                  </strong>
                  <strong>
                    <Icon name="user" /> {p.author}
                  </strong>
                </span>
              </div>
              <div className="gall_text_href">
                <Link href={`${base}/${p.id}`} className="bo_tit">
                  {p.title}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
