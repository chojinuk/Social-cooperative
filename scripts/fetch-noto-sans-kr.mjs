// Noto Sans KR (SIL OFL 1.1) 자체 호스팅용 다운로드 — 1회 실행, 결과물은 커밋
// 사용: npm run fetch-noto-sans-kr
// 결과: public/fonts/noto-sans-kr/{noto-sans-kr.css, *.woff2, LICENSE.txt}
//
// 레퍼런스 사이트는 Regular(400)·Bold(700) 두 굵기만 선언한다. 같은 두 굵기를
// Google Fonts 의 unicode-range 조각(woff2)으로 받아 두면 브라우저는 페이지에 쓰인 글자 조각만 내려받는다.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const WEIGHTS = [400, 700];
const CSS_URL = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${WEIGHTS.join(";")}&display=swap`;
// woff2 + unicode-range 를 돌려받으려면 최신 브라우저 UA 가 필요
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const out = path.join(process.cwd(), "public", "fonts", "noto-sans-kr");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const res = await fetch(CSS_URL, { headers: { "User-Agent": UA } });
if (!res.ok) throw new Error(`${res.status} ${CSS_URL}`);
const css = await res.text();

const faces = [...css.matchAll(/@font-face\s*{([^}]+)}/g)].map((m) => m[1]);
if (!faces.length) throw new Error("@font-face 를 찾지 못했습니다.");

let outCss = "/* Noto Sans KR (SIL OFL 1.1) — scripts/fetch-noto-sans-kr.mjs 로 생성. 직접 수정하지 마세요. */\n";
let total = 0;
const counter = {};
for (const face of faces) {
  const weight = face.match(/font-weight:\s*(\d+)/)?.[1];
  const src = face.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  const range = face.match(/unicode-range:\s*([^;]+);/)?.[1];
  if (!weight || !src || !range) continue;
  counter[weight] = (counter[weight] ?? 0) + 1;
  const file = `NotoSansKR-${weight}-${String(counter[weight]).padStart(3, "0")}.woff2`;
  const r = await fetch(src);
  if (!r.ok) throw new Error(`${r.status} ${src}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(path.join(out, file), buf);
  total += buf.length;
  outCss += `@font-face{font-family:"Noto Sans KR";font-style:normal;font-weight:${weight};font-display:swap;src:url(./${file}) format("woff2");unicode-range:${range.trim()}}\n`;
}
writeFileSync(path.join(out, "noto-sans-kr.css"), outCss);
writeFileSync(
  path.join(out, "LICENSE.txt"),
  `Noto Sans KR — Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'.
https://fonts.google.com/noto/specimen/Noto+Sans+KR

This Font Software is licensed under the SIL Open Font License, Version 1.1.
https://openfontlicense.org/open-font-license-official-text/
`,
);
console.log(`${Object.values(counter).reduce((a, b) => a + b, 0)} woff2 (${JSON.stringify(counter)}), ${(total / 1024 / 1024).toFixed(1)}MB → public/fonts/noto-sans-kr/`);
