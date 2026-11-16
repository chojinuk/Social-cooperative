import Link from "next/link";
import { site } from "@/config/site";
import { getLatestPosts } from "@/lib/data";
import { boardLabel, formatDate } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** 최신글 3단 (원본 .mainThreeLatArea): 공지사항 5건 · 조합이야기 6장 · 상담 및 제안 연락처 */
export async function LatestThree() {
  const [notices, stories] = await Promise.all([getLatestPosts("notice", 5), getLatestPosts("story", 6)]);

  return (
    <section className="WCMSSwr WCMSScontBoardOutside" aria-label="조합 소식">
      <div className="mainThreeLatArea">
        <div className="MTLA01">
          <div className="basicLat">
            <h2 className="latTit">
              <Link href="/news/notice">
                {boardLabel.notice} <u />
              </Link>
            </h2>
            <ul>
              {notices.length === 0 && <li className="empty_li">게시물이 없습니다.</li>}
              {notices.map((p) => (
                <li key={p.id}>
                  <Link href={`/news/notice/${p.id}`}>
                    <Icon name="caretRight" className="caret" />
                    <b>{cut(p.title, 26)}</b>
                  </Link>
                  <span className="lt_date">{formatDate(p.createdAt)}</span>
                </li>
              ))}
            </ul>
            <Link href="/news/notice" className="lt_more">
              {boardLabel.notice} 더보기 <Icon name="plusCircle" />
            </Link>
          </div>
        </div>

        <div className="MTLA02">
          <div className="galleryMainLat">
            <h2 className="latTit">
              <Link href="/news/story">
                {boardLabel.story}
                <u />
              </Link>
            </h2>
            <ul>
              {stories.length === 0 && <li className="empty_li">게시물이 없습니다.</li>}
              {stories.map((p) => (
                <li key={p.id}>
                  <Link href={`/news/story/${p.id}`}>
                    <span className="imgBg" style={p.thumbnailUrl ? { backgroundImage: `url("${p.thumbnailUrl}")` } : undefined} role="img" aria-label={p.title} />
                    <b>{cut(p.title, 26)}</b>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/news/story" className="lt_more">
              {boardLabel.story} 더보기 <Icon name="plusCircle" />
            </Link>
          </div>
        </div>

        <div className="MTLA03">
          <div className="formLat">
            <h2 className="latTit">
              <Link href="/contact">
                상담 및 제안 <u />
              </Link>
            </h2>
            <ul>
              <li className="empty_li">
                <p>
                  <strong>
                    <Icon name="phone" />
                    {site.contact.phone}
                  </strong>
                  <span>FAX: {site.contact.fax}</span>
                  <span>E-mail: {site.contact.email}</span>
                  <br />
                  <Icon name="warning" /> {site.name} 상담 및 제안
                </p>
              </li>
            </ul>
            <Link href="/contact" className="lt_more">
              상담 및 제안 바로가기 <Icon name="plusCircle" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
