@AGENTS.md

# 사회적협동조합 홈페이지

레퍼런스 사이트 http://woorimodoo.or.kr (그누보드5 THEMECRAFT 테마) 의 메인·서브 디자인과 글꼴(Noto Sans KR 400/700)을 그대로 옮긴, **다른 협동조합용** 홈페이지. 단체명·문구·이미지는 자리표시자(`○○사회적협동조합`) — 목록은 `docs/DEPLOY.md` 0절.
스택은 상상마루(`../sangsangweb`)와 같다: Next.js 16 App Router(Cache Components) · React 19 · TypeScript · Tailwind 4 · Neon(drizzle neon-http) · 로컬 PGlite · Vercel Blob · Tiptap 3 · jose+bcryptjs.

## 범위
- 회원 로그인·회원가입·조합원게시판·댓글은 **없음** (`site.features.memberAuth = false`). 단일 관리자 계정(`/admin`)만 있음.
- 게시판: 공지사항(목록형, 상단 고정·첨부파일) · 조합이야기(사진형). 상담 및 제안(`/contact`)은 비회원 작성 → 관리자만 열람.

## 규칙
- Next 16 은 학습 데이터와 다르다 → `node_modules/next/dist/docs/` 먼저 확인. `middleware` 대신 `src/proxy.ts`, `"use cache"` + `cacheTag`/`updateTag`, `revalidate`/`dynamic`/`dynamicParams` 사용 불가.
- **SEO 최우선 (구글·네이버)**: 공개 페이지는 서버에서 완성된 HTML. 공개 페이지에서 `cookies()/headers()` 금지. 모든 공개 페이지 `pageMetadata()` (src/lib/seo.tsx). 페이지당 h1 하나 — 게시글 상세는 글 제목이 h1, 서브 제목은 `SubPage titleAs="p"`.
- 동적 라우트: params 최상위 await + `export const instant = false` + `generateStaticParams` 최소 1개. 페이지네이션은 경로(`/news/notice/page/2`), 쿼리스트링 금지(검색 `/search` 만 예외·noindex).
- searchParams 는 `<Suspense>` 안 컴포넌트에서 await (src/app/(site)/search/page.tsx).
- 공개 데이터는 `src/lib/data.ts` 의 `"use cache"` 함수로만, 쓰기는 `src/actions/admin.ts` + `updateTag("posts")`. 관리자 조회는 `src/lib/admin-data.ts`(캐시 없음).
- 관리자: proxy 1차 차단 + 모든 관리자 페이지·액션 첫 줄 `await requireAdmin()`. 게시글 HTML 은 `sanitizePostHtml()`.
- 스키마 변경 시 `src/db/schema.ts` 와 `src/db/bootstrap.sql` 동시 수정. neon-http 는 트랜잭션 없음 → 순차 실행.
- 메뉴는 `src/config/menu.ts` 한 곳(헤더·모바일 서랍·좌측 메뉴·위치·배너·사이트맵). 사이트 정보는 `src/config/site.ts` 한 곳. 정적 페이지 내용은 `src/content/pages.ts` 블록.

## 디자인
- 공개 사이트 CSS 는 `src/styles/site.css` 하나 — 레퍼런스 CSS 를 **같은 선택자 이름**(#hd, #gnb, #snb, .WCMSS*, .likeTbl, #bo_v …)으로 옮긴 것. 새 화면도 레퍼런스 스킨 구조를 따른다. Tailwind 유틸리티는 관리자 화면에서만.
- 색은 `--color-theme`(#1192a2) 등 `src/app/globals.css @theme` 토큰. 레퍼런스가 테마색으로 덮어쓰던 곳은 모두 `var(--color-theme)`.
- 기본값은 `.site-root` 아래에만(12px 본문, a 검정) — 관리자 화면에 새지 않게. 기본 규칙은 `:where()` 로 낮은 우선순위 유지.
- 상태 클래스: `html.scDown`(스크롤, 유틸바 접힘·위로 버튼) · `html.ovfH`(모바일 서랍 열림) · `.on`/`.show`(펼침).
- 브레이크포인트: 1400 / 1100 / **980(모바일 전환)** / 850 / 800 / 700 / 680 / 650.
- 글꼴은 `public/fonts/noto-sans-kr` 자체 호스팅(`npm run fetch-noto-sans-kr` 로 생성), 날짜·카피라이트는 Verdana. 다른 웹폰트 추가 금지. 아이콘은 `src/components/ui/Icon.tsx` 인라인 SVG(Font Awesome 대체).

## 검증
`npm run lint && npm run typecheck && npm test && npm run build`. 크롤러 확인 `curl -A "Yeti" http://localhost:3000/...`.
로컬 실행 `npm run dev` (PGlite + 예시 데이터, 초기화는 `.data/` 삭제). 관리자 로그인은 `.env.local` 의 ADMIN_* 값.
