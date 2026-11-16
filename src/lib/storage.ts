import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * 파일 저장소 (상상마루 src/lib/storage.ts 기반 + 첨부파일 폴더)
 * - Vercel Blob: 브라우저 → Blob 직접 업로드 (Vercel 서버 함수는 요청 본문 4.5MB 제한이 있어 서버를 거치지 않는다)
 *   · BLOB_READ_WRITE_TOKEN 이 있으면 "token" — client upload, 토큰은 /api/admin/upload 가 발급
 *   · 없고 BLOB_STORE_ID 가 있으면 "presigned" — 새 Blob 연결(OIDC). /api/admin/upload 가 서명된 업로드 URL 발급
 *   공개 URL 은 *.public.blob.vercel-storage.com
 * - 없으면(로컬 개발): .data/uploads 에 저장, /uploads/* 로 서빙
 *
 * DB 에는 url(표시용) 과 storageKey(삭제용) 를 함께 저장한다.
 * storageKey 는 Blob 이면 Blob URL, 로컬이면 folder/YYYY/MM/uuid.ext 키.
 */
export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** 첨부파일 허용 확장자 → Content-Type (hwp 는 브라우저마다 type 이 달라 확장자로 판단) */
export const FILE_EXTS: Record<string, string> = {
  pdf: "application/pdf",
  hwp: "application/x-hwp",
  hwpx: "application/hwp+zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
  txt: "text/plain",
  jpg: "image/jpeg",
  png: "image/png",
};

export const UPLOAD_FOLDERS = ["posts", "files"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** 폴더별 최대 크기 — 본문 이미지는 브라우저에서 리사이즈 후 업로드 */
export const MAX_BYTES: Record<UploadFolder, number> = {
  posts: 10 * 1024 * 1024,
  files: 20 * 1024 * 1024,
};

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const IMAGE_EXT = "jpg|png|webp|gif";
const FILE_EXT = Object.keys(FILE_EXTS).join("|");
const KEY_RE = new RegExp(`^(?:posts/\\d{4}/\\d{2}/[0-9a-f-]{36}\\.(?:${IMAGE_EXT})|files/\\d{4}/\\d{2}/[0-9a-f-]{36}\\.(?:${FILE_EXT}))$`);

export type BlobMode = "token" | "presigned";

export function blobMode(): BlobMode | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "token";
  if (process.env.BLOB_STORE_ID) return "presigned";
  return null;
}

export function isBlobConfigured() {
  return blobMode() !== null;
}

/** 업로드 요청 검증 → 확장자. 허용되지 않으면 null */
export function extFor(folder: UploadFolder, contentType: string, fileName?: string) {
  if (folder === "posts") return IMAGE_TYPES[contentType] ?? null;
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  return FILE_EXTS[ext] ? ext : null;
}

export function contentTypeForKey(key: string) {
  const ext = key.split(".").pop()!.toLowerCase();
  return FILE_EXTS[ext] ?? Object.entries(IMAGE_TYPES).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
}

export function newKey(folder: UploadFolder, ext: string) {
  const d = new Date();
  const ym = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${folder}/${ym}/${randomUUID()}.${ext}`;
}

/** 키 검증: folder/YYYY/MM/uuid.ext 형식만 허용 (경로 조작 방지) */
export function isSafeKey(key: string) {
  return KEY_RE.test(key);
}

/** Vercel Blob 공개 URL 인지 */
export function isBlobUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export type StoredObject = { url: string; storageKey: string };

/**
 * 브라우저가 올린 결과({ key, url })를 DB 에 저장할 값으로 바꾼다. 검증 실패 시 null.
 * - Blob: url 이 우리 Blob 호스트이고 경로가 key 와 같아야 함 (다른 곳의 URL 을 끼워 넣지 못하게)
 * - 로컬: url 은 무시하고 키로 /uploads 경로를 만든다
 */
export function resolveUpload(input: { key?: unknown; url?: unknown }): StoredObject | null {
  const key = input.key;
  if (typeof key !== "string" || !isSafeKey(key)) return null;
  if (isBlobConfigured()) {
    const url = input.url;
    if (typeof url !== "string" || !isBlobUrl(url) || new URL(url).pathname !== `/${key}`) return null;
    return { url, storageKey: url };
  }
  return { url: `/uploads/${key}`, storageKey: key };
}

export async function writeLocalObject(key: string, data: Uint8Array) {
  const file = path.join(LOCAL_UPLOAD_DIR, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
}

/** 저장소에서 삭제 — storageKey(Blob URL 또는 로컬 키). 실패해도 DB 삭제는 진행 */
export async function deleteObject(ref: string | null | undefined) {
  if (!ref) return;
  try {
    if (isBlobUrl(ref)) {
      if (!isBlobConfigured()) return;
      const { del } = await import("@vercel/blob");
      await del(ref);
    } else if (isSafeKey(ref)) {
      await unlink(path.join(LOCAL_UPLOAD_DIR, ref));
    }
  } catch (err) {
    console.error("[storage] delete failed", ref, err);
  }
}

/** 본문 <img src> → storageKey (게시글 저장·삭제 시 안 쓰는 이미지 정리용). 우리 저장소 것이 아니면 null */
export function keyFromUrl(url: string) {
  if (isBlobUrl(url)) return url;
  const m = url.match(/^\/uploads\/(.+)$/);
  return m && isSafeKey(m[1]) ? m[1] : null;
}
