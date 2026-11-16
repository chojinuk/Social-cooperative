# ○○사회적협동조합 홈페이지

레퍼런스 사이트(woorimodoo.or.kr)의 메인·서브 디자인과 글꼴을 그대로 옮긴 사회적협동조합 홈페이지입니다.
Next.js 16 · Neon(Postgres) · Vercel Blob · Vercel 배포 (상상마루 홈페이지와 같은 구성).

## 로컬 실행

Node.js 22 이상.

```bash
npm install
cp .env.example .env.local      # ADMIN_ID · ADMIN_PASSWORD_HASH · AUTH_SECRET 채우기 (관리자 로그인용)
npm run dev                     # 내장 DB(PGlite) + 예시 데이터로 http://localhost:3000
```

- 관리자: http://localhost:3000/admin
- 비밀번호 해시: `npm run hash-password -- '비밀번호'`, 비밀키: `openssl rand -base64 32`
- 로컬 DB 초기화: `.data/` 폴더 삭제 후 다시 `npm run dev`
- Neon 에 직접 붙어 개발: `.env.local` 에 `DATABASE_URL` 넣고 `npm run dev:remote`

## 구성

| 화면 | 주소 | 내용 |
|---|---|---|
| 메인 | `/` | 슬라이드 · 사업 카드 4개 · 공지/조합이야기/상담 3단 · 관련기관 배너 |
| 조합소개 | `/about/{greeting,organization,history,articles,location}` | 인사말 · 조직 · 연혁 · 정관 · 오시는길 |
| 사업소개 | `/business/business-{1,2,3}` | 사업 안내 |
| 조합소식 | `/news/notice`, `/news/story` | 공지사항(목록형) · 조합이야기(사진형) |
| 상담 및 제안 | `/contact` | 비회원 작성 → 관리자만 열람 |
| 후원안내 · 협력기관 | `/support`, `/partners/partner-{1,2,3}` | |
| 검색 | `/search?q=` | 게시글 제목·내용 검색 (검색엔진 비노출) |
| 관리자 | `/admin` | 공지·조합이야기 작성(상단 고정·첨부파일) · 상담 및 제안 열람 |

검색엔진: `sitemap.xml`, `robots.txt`, `rss.xml`, 페이지별 canonical·OG, JSON-LD(단체·웹사이트·위치·게시글), 네이버/구글 소유확인 메타태그(환경변수).

## 내용 바꾸기

| 무엇 | 파일 |
|---|---|
| 단체명·연락처·주소·지도 | `src/config/site.ts` |
| 메뉴 | `src/config/menu.ts` |
| 정적 페이지 문구 | `src/content/pages.ts`, `src/content/history.ts`, `src/content/policies.ts` |
| 메인 슬라이드·카드·배너 | `src/content/home.ts` |
| 이미지 | `public/placeholder/*`, `public/logo.svg`, `public/logo.png`, `public/og-default.png` |
| 주조색 | `src/app/globals.css` 의 `--color-theme` (+ `src/config/site.ts` themeColor) |

## 검사

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

배포는 [docs/DEPLOY.md](docs/DEPLOY.md).
