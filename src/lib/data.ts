import "server-only";
import { and, asc, count, desc, eq, gt, ilike, inArray, lt, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { postFiles, posts, type BoardType } from "@/db/schema";

/**
 * 공개 페이지용 데이터 (캐시됨).
 * 관리자가 글을 저장하면 actions 에서 updateTag("posts") 로 즉시 갱신된다.
 * cacheLife("hours") 는 조회수 표시를 위한 주기적 갱신용 (조회수는 최대 1시간 늦게 보임).
 */

export type PostSummary = {
  id: number;
  boardType: BoardType;
  title: string;
  excerpt: string;
  thumbnailUrl: string | null;
  isNotice: boolean;
  author: string;
  views: number;
  createdAt: string;
  fileCount: number;
};

export type PostAttachment = { id: number; fileName: string; url: string; size: number; createdAt: string };

export type PostDetail = PostSummary & {
  content: string;
  updatedAt: string;
  files: PostAttachment[];
  prev: { id: number; title: string } | null;
  next: { id: number; title: string } | null;
};

/** 레퍼런스(그누보드) 기본값과 같은 페이지당 15건 */
export const POSTS_PER_PAGE = 15;

const summaryCols = {
  id: posts.id,
  boardType: posts.boardType,
  title: posts.title,
  excerpt: posts.excerpt,
  thumbnailUrl: posts.thumbnailUrl,
  isNotice: posts.isNotice,
  author: posts.author,
  views: posts.views,
  createdAt: posts.createdAt,
};

type Row = Omit<PostSummary, "createdAt" | "fileCount"> & { createdAt: Date };

async function withFileCounts(rows: Row[]): Promise<PostSummary[]> {
  if (!rows.length) return [];
  const db = await getDb();
  const counts = await db
    .select({ postId: postFiles.postId, n: count() })
    .from(postFiles)
    .where(inArray(postFiles.postId, rows.map((r) => r.id)))
    .groupBy(postFiles.postId);
  const map = new Map(counts.map((c) => [c.postId, Number(c.n)]));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), fileCount: map.get(r.id) ?? 0 }));
}

const published = (board: BoardType) => and(eq(posts.boardType, board), eq(posts.isPublished, true));

export async function getLatestPosts(board: BoardType, limit = 5): Promise<PostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  const db = await getDb();
  const rows = await db.select(summaryCols).from(posts).where(published(board)).orderBy(desc(posts.createdAt), desc(posts.id)).limit(limit);
  return withFileCounts(rows);
}

/** 목록 페이지: 고정글(공지)은 매 페이지 상단에 따로, 일반 글은 번호와 함께 페이지 나눔 */
export async function getPostsPage(board: BoardType, page: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  const db = await getDb();
  const [{ total }] = await db.select({ total: count() }).from(posts).where(published(board));
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const [pinnedRows, rows] = await Promise.all([
    board === "notice"
      ? db.select(summaryCols).from(posts).where(and(published(board), eq(posts.isNotice, true))).orderBy(desc(posts.createdAt))
      : Promise.resolve([] as Row[]),
    db
      .select(summaryCols)
      .from(posts)
      .where(published(board))
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(POSTS_PER_PAGE)
      .offset((page - 1) * POSTS_PER_PAGE),
  ]);
  const [pinned, items] = await Promise.all([withFileCounts(pinnedRows), withFileCounts(rows)]);
  return { pinned, items, total, totalPages, page };
}

export async function getPost(board: BoardType, id: number): Promise<PostDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", `post-${id}`);
  if (!Number.isInteger(id) || id <= 0) return null;
  const db = await getDb();
  const [row] = await db
    .select({ ...summaryCols, content: posts.content, updatedAt: posts.updatedAt })
    .from(posts)
    .where(and(eq(posts.id, id), published(board)));
  if (!row) return null;
  const [[prev], [next], files] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(and(published(board), lt(posts.createdAt, row.createdAt)))
      .orderBy(desc(posts.createdAt))
      .limit(1),
    db
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(and(published(board), gt(posts.createdAt, row.createdAt)))
      .orderBy(asc(posts.createdAt))
      .limit(1),
    db
      .select({ id: postFiles.id, fileName: postFiles.fileName, url: postFiles.url, size: postFiles.size, createdAt: postFiles.createdAt })
      .from(postFiles)
      .where(eq(postFiles.postId, id))
      .orderBy(asc(postFiles.sortOrder), asc(postFiles.id)),
  ]);
  const { updatedAt, content, ...rest } = row;
  return {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
    fileCount: files.length,
    content,
    updatedAt: updatedAt.toISOString(),
    files: files.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() })),
    prev: prev ?? null,
    next: next ?? null,
  };
}

/** generateStaticParams · sitemap 용 */
export async function getPostIndex(): Promise<{ id: number; boardType: BoardType; updatedAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  const db = await getDb();
  const rows = await db
    .select({ id: posts.id, boardType: posts.boardType, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.isPublished, true))
    .orderBy(desc(posts.createdAt));
  return rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }));
}

/** RSS 용: 전체 게시판 최신 글 */
export async function getRecentPostsAll(limit = 30): Promise<PostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  const db = await getDb();
  const rows = await db.select(summaryCols).from(posts).where(eq(posts.isPublished, true)).orderBy(desc(posts.createdAt)).limit(limit);
  return withFileCounts(rows);
}

/** 사이트 내 검색 (제목+내용) — 검색 결과 페이지는 검색엔진 비노출(noindex) */
export async function searchPosts(q: string, board: BoardType | null = null, limit = 50): Promise<PostSummary[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");
  const term = q.trim().slice(0, 40);
  if (term.length < 2) return [];
  const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const db = await getDb();
  const rows = await db
    .select(summaryCols)
    .from(posts)
    .where(
      and(
        eq(posts.isPublished, true),
        board ? eq(posts.boardType, board) : undefined,
        or(ilike(posts.title, like), ilike(posts.content, like)),
      ),
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit);
  return withFileCounts(rows);
}
