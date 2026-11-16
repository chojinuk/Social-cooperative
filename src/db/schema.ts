import { boolean, index, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** 게시판: 공지사항(목록형) · 조합이야기(사진형) — 이름은 src/lib/format.ts boardLabel */
export const BOARD_TYPES = ["notice", "story"] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    boardType: varchar("board_type", { length: 20, enum: BOARD_TYPES }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    /** 정제(sanitize)된 HTML */
    content: text("content").notNull(),
    /** 본문에서 추출한 요약 (meta description, 목록 미리보기) */
    excerpt: varchar("excerpt", { length: 300 }).notNull().default(""),
    /** 본문 첫 이미지 (OG 이미지, 사진형 목록 썸네일) */
    thumbnailUrl: text("thumbnail_url"),
    /** 목록 상단 고정 (공지) */
    isNotice: boolean("is_notice").notNull().default(false),
    author: varchar("author", { length: 50 }).notNull().default("관리자"),
    views: integer("views").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("posts_board_created_idx").on(t.boardType, t.createdAt)],
);

/** 게시글 첨부파일 */
export const postFiles = pgTable(
  "post_files",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    url: text("url").notNull(),
    /** 저장소 객체 키 (삭제 시 사용) */
    storageKey: text("storage_key"),
    size: integer("size").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("post_files_post_idx").on(t.postId, t.sortOrder)],
);

/** 상담 및 제안 (공개 폼 → 관리자만 열람) */
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    email: varchar("email", { length: 120 }).notNull().default(""),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    subject: varchar("subject", { length: 200 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_created_idx").on(t.createdAt)],
);

export type Post = typeof posts.$inferSelect;
export type PostFile = typeof postFiles.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
