import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewCounter } from "@/components/board/ViewCounter";
import { SubPage } from "@/components/layout/SubPage";
import { Icon } from "@/components/ui/Icon";
import { BOARD_TYPES, type BoardType } from "@/db/schema";
import { getPost, getPostIndex } from "@/lib/data";
import { boardLabel, formatBytes, formatDateTime } from "@/lib/format";
import { articleJsonLd, JsonLd, pageMetadata } from "@/lib/seo";

// 검색엔진에 완성된 HTML·정확한 404 상태를 주기 위해 URL 값을 기다려 서버에서 완전히 렌더링
export const instant = false;

export async function generateStaticParams() {
  const index = await getPostIndex();
  const params = index.map((p) => ({ board: p.boardType, id: String(p.id) }));
  // Cache Components 는 최소 1개의 예시 값이 필요 (없는 글은 404 처리)
  return params.length ? params : [{ board: "notice", id: "0" }];
}

async function load(params: Promise<{ board: string; id: string }>) {
  const { board, id } = await params;
  if (!BOARD_TYPES.includes(board as BoardType)) notFound();
  const post = await getPost(board as BoardType, Number(id));
  if (!post) notFound();
  return post;
}

export async function generateMetadata({ params }: PageProps<"/news/[board]/[id]">): Promise<Metadata> {
  const post = await load(params);
  return pageMetadata({
    title: post.title,
    description: post.excerpt || `${boardLabel[post.boardType]} - ${post.title}`,
    path: `/news/${post.boardType}/${post.id}`,
    image: post.thumbnailUrl,
    type: "article",
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt,
  });
}

/** 게시글 읽기 (원본 #bo_v): 제목 → 작성자·조회·작성일 → 본문 → 첨부파일 → 목록 버튼 + 이전/다음글 */
export default async function Page({ params }: PageProps<"/news/[board]/[id]">) {
  const post = await load(params);
  const base = `/news/${post.boardType}`;
  const path = `${base}/${post.id}`;

  return (
    <SubPage path={path} title={boardLabel[post.boardType]} titleAs="p" crumbs={[{ name: post.title, path }]}>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path,
          image: post.thumbnailUrl,
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
        })}
      />
      <ViewCounter id={post.id} />
      <article id="bo_v">
        <header>
          <h1 id="bo_v_title">
            <span className="bo_v_tit">{post.title}</span>
          </h1>
        </header>
        <section id="bo_v_info" aria-label="게시글 정보">
          <strong className="member">
            <span className="sound_only">작성자</span>
            {post.author}
          </strong>
          <strong>
            <span className="sound_only">조회</span>
            <Icon name="eye" /> {post.views}회
          </strong>
          <strong className="if_date">
            <span className="sound_only">작성일</span>
            <Icon name="clock" /> <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
          </strong>
        </section>

        <div id="bo_v_con" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.files.length > 0 && (
          <section id="bo_v_file">
            <h2>첨부파일</h2>
            <ul>
              {post.files.map((f) => (
                <li key={f.id}>
                  <Icon name="download" />
                  <a href={f.url} download={f.fileName} target="_blank" rel="noopener">
                    <strong>{f.fileName}</strong>
                  </a>{" "}
                  ({formatBytes(f.size)})<span className="bo_v_file_cnt">DATE : {formatDateTime(f.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div id="bo_v_top">
          <ul className="bo_v_com">
            <li>
              <Link href={base} className="btn_b01">
                <Icon name="list" /> 목록
              </Link>
            </li>
          </ul>
          {(post.prev || post.next) && (
            <ul className="bo_v_nb">
              {post.prev && (
                <li className="btn_prev">
                  <Link href={`${base}/${post.prev.id}`}>
                    <span className="arr">
                      <Icon name="arrowLeft" />
                    </span>
                    <span className="sound_only">이전글</span>
                    <b>{post.prev.title}</b>
                  </Link>
                </li>
              )}
              {post.next && (
                <li className="btn_next">
                  <Link href={`${base}/${post.next.id}`}>
                    <span className="arr">
                      <Icon name="arrowRight" />
                    </span>
                    <span className="sound_only">다음글</span>
                    <b>{post.next.title}</b>
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </article>
    </SubPage>
  );
}
