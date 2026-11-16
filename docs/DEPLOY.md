# 배포 가이드 (Vercel 하나로 — 호스팅 + Neon DB + Blob 파일 저장소)

처음 한 번만 하면 되고, 이후에는 `main` 브랜치에 push 하면 Vercel 이 자동 배포합니다.
상상마루 홈페이지와 같은 구성입니다. 가입·결제는 Vercel 한 곳이고, DB(Neon)와 파일 저장소(Blob)는 Vercel 안에서 만들어 청구서에 합산됩니다.

| 구성 | 역할 | 예상 비용(월) |
|---|---|---|
| Vercel Pro | Next.js 호스팅 · 도메인 · HTTPS · CDN | $20 (멤버 1명당. Hobby 무료 플랜은 상업용 사용 불가) |
| Neon (Vercel Marketplace, Free) | Postgres DB — 게시글·첨부파일 정보·상담 접수 | $0 (0.5GB까지) |
| Vercel Blob | 본문 이미지·첨부파일 저장·전송 | $1 안쪽 |

> 상상마루와 같은 Vercel 팀에 **프로젝트만 추가**하면 추가 요금이 없습니다. DB·Blob 스토어는 사이트마다 따로 만드세요.

## 0. 운영 전에 바꿀 내용 (자리표시자)

| 무엇 | 어디 |
|---|---|
| 단체명·연락처·주소·지도·슬로건 | `src/config/site.ts` |
| 메뉴 이름(사업·협력기관 명칭) | `src/config/menu.ts` |
| 인사말·조직·정관·사업·후원·협력기관 문구 | `src/content/pages.ts` |
| 연혁 | `src/content/history.ts` |
| 메인 슬라이드·사업 카드·관련기관 배너 | `src/content/home.ts` + 이미지 |
| 약관 3종 | `src/content/policies.ts` |
| 로고 | `public/logo.svg`(헤더·푸터), `public/logo.png`(512×512, 검색엔진용), `src/app/icon.svg`, `src/app/apple-icon.png` |
| SNS 미리보기 이미지 | `public/og-default.png` (1200×630) |
| 자리표시 이미지 | `public/placeholder/*` — 같은 비율로 교체 (슬라이드 900×400, 사업 카드 400×202, 배너 550×174, 서브 배너 1920×500) |

## 1. 프로젝트 만들기

1. Vercel 팀 대시보드 → **Add New → Project** → 이 GitHub 저장소 Import (Framework: Next.js 자동 인식)
2. 일단 **Deploy** — 환경변수가 없어도 빌드는 됩니다(빈 메모리 DB). 아래 2~4 를 마친 뒤 Redeploy.

## 2. DB · 파일 저장소 연결 (프로젝트 → Storage 탭)

1. **Create Database → Neon (Postgres)** → **Vercel-managed** → Region `Singapore (ap-southeast-1)` → Free → Connect
   - `DATABASE_URL`·`POSTGRES_URL` 이 자동 주입됩니다(코드는 둘 다 인식).
2. **Create → Blob** → 스토어 이름 예: `coop-files` → Connect · **Access 는 Public**
   - `BLOB_STORE_ID`(새 방식) 또는 `BLOB_READ_WRITE_TOKEN`(예전 방식) 중 무엇이 들어가도 동작합니다.

## 3. 나머지 환경변수 (Settings → Environment Variables, Production · Preview 모두)

```bash
npm run hash-password -- '관리자비밀번호(10자 이상)'   # → ADMIN_PASSWORD_HASH
openssl rand -base64 32                                # → AUTH_SECRET
```

| 이름 | 값 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://운영도메인` (끝에 / 없이) |
| `ADMIN_ID` | 관리자 아이디 |
| `ADMIN_PASSWORD_HASH` | 위에서 만든 값 |
| `AUTH_SECRET` | 위에서 만든 값 |
| `NAVER_SITE_VERIFICATION` | (6 에서 받은 값) |
| `GOOGLE_SITE_VERIFICATION` | (6 에서 받은 값) |

> `NEXT_PUBLIC_*` 값이나 검증 코드를 바꾼 뒤에는 **Redeploy** 해야 반영됩니다.

## 4. 테이블 만들기 (한 번만, 여러 번 실행해도 안전)

Storage → Neon → `.env.local` 탭에서 `DATABASE_URL` 을 복사한 뒤 로컬에서:

```bash
DATABASE_URL='복사한주소' npm run db:init
```

(또는 Neon 콘솔 SQL Editor 에 `src/db/bootstrap.sql` 을 붙여넣어 실행) → **Redeploy** → `*.vercel.app` 에서 `/admin` 로그인·글 작성·첨부파일 업로드 확인.

## 5. 도메인 연결

1. Settings → Domains → `도메인`, `www.도메인` 추가 (www → apex 리디렉트 권장)
2. 도메인 등록처 DNS: `@` A 레코드(Vercel 안내 IP), `www` CNAME `cname.vercel-dns.com`
3. HTTPS 인증서는 자동 발급

## 6. 검색엔진 등록 (가장 중요)

### 네이버 서치어드바이저 — https://searchadvisor.naver.com
1. 웹마스터 도구 → 사이트 등록 → `https://도메인`
2. 소유 확인 → **HTML 태그** → `content="..."` 값 → `NAVER_SITE_VERIFICATION` → Redeploy → 확인
3. 요청 → **사이트맵 제출** `https://도메인/sitemap.xml`, **RSS 제출** `https://도메인/rss.xml`
4. 검증 → 웹 페이지 수집 요청, robots.txt 검증

### 구글 서치콘솔 — https://search.google.com/search-console
1. 속성 추가 → URL 접두어 `https://도메인`
2. **HTML 태그** → `GOOGLE_SITE_VERIFICATION` → Redeploy → 확인 (또는 DNS TXT 로 도메인 속성)
3. Sitemaps → `sitemap.xml` 제출 → URL 검사로 홈·주요 페이지 색인 요청

### 다음(카카오) — https://register.search.daum.net
- 사이트 등록 신청 (URL만 입력)

## 7. 배포 후 점검

- [ ] `/robots.txt` 에 `Disallow: /admin`, `/search` 와 Sitemap 주소
- [ ] `/sitemap.xml`, `/rss.xml` 정상
- [ ] 페이지 소스에 `<title>`, `description`, `og:image`, `canonical`, `naver-site-verification`
- [ ] `/admin` → 공지 작성(고정·첨부파일·본문 이미지) → 메인·목록·상세에 즉시 반영, 첨부 주소가 `*.public.blob.vercel-storage.com`
- [ ] `/contact` 접수 → 관리자 "상담 및 제안"에 표시
- [ ] 카카오톡 공유 미리보기 이미지 표시
