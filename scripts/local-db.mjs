// 로컬 개발용 내장 Postgres (PGlite) — 한 프로세스가 DB를 소유하고 HTTP로 쿼리를 받는다.
// (Next 개발 서버는 여러 워커 프로세스를 쓰므로 DB 파일을 직접 열면 손상됨 → 이 서버를 통해 공유)
// - .data/pglite 에 데이터 저장, 첫 실행 시 테이블 생성 + 예시 데이터 입력
// - 사용: `npm run dev` (DB 서버 + next dev 동시 실행) / `npm run db:local` (DB 서버만)
// - 운영(Vercel)에서는 사용하지 않음 — DATABASE_URL(Neon) 사용
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
const PORT = Number(process.env.LOCAL_DB_PORT || 54329);
const dataDir = path.join(root, ".data", "pglite");
mkdirSync(dataDir, { recursive: true });

const db = await PGlite.create(dataDir);
await db.exec(readFileSync(path.join(root, "src/db/bootstrap.sql"), "utf8"));
await seed(db);

// drizzle-orm/pg-proxy 규약: method "all" → 행을 값 배열로, "execute" → 객체로
const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/query") {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const { sql, params, method } = JSON.parse(body);
      const result = await db.query(sql, params ?? [], method === "all" ? { rowMode: "array" } : undefined);
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ rows: result.rows }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ error: String(err?.message ?? err) }));
    }
  });
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const url = `http://127.0.0.1:${PORT}`;
console.log(`\n  ▶ 로컬 DB 서버: ${url}  (데이터: .data/pglite · 초기화하려면 폴더 삭제)\n`);

let child;
let shuttingDown = false;
const runIdx = process.argv.indexOf("--run");

if (runIdx > -1) {
  const cmd = process.argv.slice(runIdx + 1);
  // Windows / macOS 공통 Next.js 실행
  const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");
  child = spawn(process.execPath, [nextCli, ...cmd.slice(1)], {
    stdio: "inherit",
    env: { ...process.env, LOCAL_DB_URL: url },
  });
  child.once("exit", (code, signal) => void shutdown(code ?? (signal ? 0 : 1)));
  child.once("error", (err) => {
    console.error("Next.js 실행 오류:", err);
    void shutdown(1);
  });
}

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await db.close();
    console.log("▶ 로컬 DB 서버 종료 완료");
  } catch (err) {
    console.error("로컬 DB 종료 오류:", err);
    code = 1;
  } finally {
    process.exit(code);
  }
}

function handleSignal(signal) {
  if (child && child.exitCode === null && child.signalCode === null) {
    if (!child.kill(signal)) void shutdown(1);
  } else {
    void shutdown();
  }
}
process.on("SIGINT", () => handleSignal("SIGINT"));
process.on("SIGTERM", () => handleSignal("SIGTERM"));

/** 비어 있으면 화면 확인용 예시 데이터 입력 (로컬 전용 · 자리표시자 문구) */
async function seed(pg) {
  const { rows } = await pg.query("SELECT count(*)::int AS n FROM posts");
  if (rows[0].n > 0) return;
  const day = 86400000;
  const base = new Date("2026-11-10T10:00:00+09:00").getTime();
  const body = (t) =>
    `<p>${t}</p><p>자세한 내용은 첨부파일을 확인하시거나 사무국으로 문의해 주시기 바랍니다.</p><ul><li>일시: 0000년 00월 00일 (요일) 00:00</li><li>장소: 조합 사무실</li><li>문의: 000-0000-0000</li></ul>`;

  const notices = [
    ["0000년 제0차 정기총회 소집 공고", true, true],
    ["0000년 제0차 이사회 소집 공고", true, true],
    ["0000년 추가경정예산서 공고", true, true],
    ["[모집] 마을 프로그램 참여자 모집 안내", false, false],
    ["[안내] 조합원 교육 일정 안내", false, true],
    ["[모집] 방과후 프로그램 신규 이용자 모집", false, false],
    ["사무실 휴무 안내", false, false],
    ["[결과] 0000년 정기총회 결과 공고", false, true],
    ["[모집] 자원활동가 모집", false, false],
    ["[안내] 후원금 영수증 발급 안내", false, false],
    ["[공고] 직원 채용 공고", false, true],
    ["[안내] 마을 축제 개최 안내", false, false],
    ["[결과] 0000년 이사회 결과 공고", false, false],
    ["0000년 사업계획서 공고", false, true],
    ["0000년 결산 보고서 공고", false, true],
    ["[안내] 홈페이지 새 단장 안내", false, false],
    ["[모집] 부모 모임 참여자 모집", false, false],
    ["[안내] 협동조합 가입 안내", false, false],
  ];
  for (const [i, [title, isNotice, hasFile]] of notices.entries()) {
    const at = new Date(base - i * 9 * day).toISOString();
    const { rows: r } = await pg.query(
      "INSERT INTO posts (board_type,title,content,excerpt,is_notice,views,created_at,updated_at) VALUES ('notice',$1,$2,$3,$4,$5,$6,$6) RETURNING id",
      [title, body(`${title} 내용입니다.`), `${title} 내용입니다. 자세한 내용은 첨부파일을 확인하시거나 사무국으로 문의해 주시기 바랍니다.`, isNotice, 20 + ((i * 37) % 90), at],
    );
    if (hasFile) {
      await pg.query("INSERT INTO post_files (post_id,file_name,url,size,created_at) VALUES ($1,$2,$3,$4,$5)", [
        r[0].id,
        `${title.replace(/[[\]]/g, "").trim()}.pdf`,
        "/placeholder/sample-attachment.pdf",
        408,
        at,
      ]);
    }
  }

  const stories = [
    "[마을소식] 세대공감 마을합창 연습 이야기",
    "[총회] 정기총회 현장",
    "[이사회] 이사회 회의 모습",
    "[교육] 조합원 교육 현장",
    "[마을소식] 마을 나들이",
    "[지점소식] 복지관 프로그램 소식",
    "[마을소식] 김장 나눔 행사",
    "[교육] 부모 모임 이야기",
    "[마을소식] 여름 물놀이",
    "[지점소식] 어르신 생신잔치",
  ];
  for (const [i, title] of stories.entries()) {
    const img = `/placeholder/story-${(i % 6) + 1}.svg`;
    const at = new Date(base - i * 7 * day - day).toISOString();
    await pg.query(
      "INSERT INTO posts (board_type,title,content,excerpt,thumbnail_url,views,created_at,updated_at) VALUES ('story',$1,$2,$3,$4,$5,$6,$6)",
      [title, `<img src="${img}" alt="${title}" />${body(`${title} 소식을 전합니다.`)}`, `${title} 소식을 전합니다.`, img, 10 + ((i * 23) % 70), at],
    );
  }
  console.log(`  ▶ 예시 데이터를 입력했습니다 (공지 ${notices.length} · 조합이야기 ${stories.length})`);
}
