// 메뉴·날짜 형식 단위 테스트 — npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { findSection, internalPaths, mainMenu } from "../src/config/menu.ts";
import { formatBytes, formatDate, formatDateTime, formatShortDate } from "../src/lib/format.ts";

test("2차 메뉴 경로로 1차·2차 메뉴를 찾는다", () => {
  const r = findSection("/news/notice");
  assert.equal(r?.section.label, "조합소식");
  assert.equal(r?.child.label, "공지사항");
});

test("게시글 상세·페이지 주소도 소속 게시판 메뉴로 찾는다", () => {
  assert.equal(findSection("/news/story/12")?.child.href, "/news/story");
  assert.equal(findSection("/news/notice/page/3")?.child.href, "/news/notice");
});

test("메뉴에 없는 주소는 null", () => {
  assert.equal(findSection("/search"), null);
  assert.equal(findSection("/"), null);
});

test("외부 링크 메뉴는 사이트맵 경로에서 빠진다", () => {
  const paths = internalPaths();
  assert.ok(paths.every((p) => p.startsWith("/")));
  assert.ok(!paths.some((p) => p.startsWith("http")));
});

test("정적 페이지로 그리는 메뉴 경로는 모두 src/content/pages.ts 에 내용이 있다", () => {
  const src = readFileSync(new URL("../src/content/pages.ts", import.meta.url), "utf8");
  const dynamic = ["/news/", "/contact"];
  for (const p of internalPaths().filter((p) => !dynamic.some((d) => p.startsWith(d)))) {
    assert.ok(src.includes(`"${p}":`), `pages.ts 에 ${p} 내용이 없습니다`);
  }
});

test("1차 메뉴마다 서브 배너가 있다", () => {
  for (const m of mainMenu) assert.match(m.banner, /^\/placeholder\/|^\//);
});

test("날짜는 한국 시간 기준", () => {
  const iso = "2026-11-04T09:14:00Z"; // KST 18:14
  assert.equal(formatDate(iso), "2026-11-04");
  assert.equal(formatShortDate(iso), "11-04");
  assert.equal(formatDateTime(iso), "26-11-04 18:14");
  assert.equal(formatDateTime("2026-11-03T15:05:00Z"), "26-11-04 00:05");
});

test("첨부파일 크기 표시", () => {
  assert.equal(formatBytes(500), "500B");
  assert.equal(formatBytes(193126), "188.6K");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0M");
});
