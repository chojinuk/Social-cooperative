-- 테이블 생성 (src/db/schema.ts 와 동일하게 유지)
-- 운영(Neon)은 `DATABASE_URL=... npm run db:init` 또는 이 SQL을 Neon 콘솔 SQL Editor 에서 실행
CREATE TABLE IF NOT EXISTS posts (
  id serial PRIMARY KEY,
  board_type varchar(20) NOT NULL,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  excerpt varchar(300) NOT NULL DEFAULT '',
  thumbnail_url text,
  is_notice boolean NOT NULL DEFAULT false,
  author varchar(50) NOT NULL DEFAULT '관리자',
  views integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_board_created_idx ON posts (board_type, created_at);
CREATE TABLE IF NOT EXISTS post_files (
  id serial PRIMARY KEY,
  post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_name varchar(255) NOT NULL,
  url text NOT NULL,
  storage_key text,
  size integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_files_post_idx ON post_files (post_id, sort_order);
CREATE TABLE IF NOT EXISTS inquiries (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL,
  email varchar(120) NOT NULL DEFAULT '',
  phone varchar(40) NOT NULL DEFAULT '',
  subject varchar(200) NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_created_idx ON inquiries (created_at);
