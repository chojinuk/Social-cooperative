"use client";

import { upload, uploadPresigned } from "@vercel/blob/client";

/** 관리자 브라우저 → 저장소 업로드 (본문 이미지는 최대 2000px WebP 로 줄인 뒤, 첨부파일은 원본 그대로) */
export type Uploaded = { key: string; url: string; size: number };

const MAX_SIDE = 2000;

async function resize(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  return blob && blob.type === "image/webp" ? blob : file;
}

type Prepared =
  | { mode: "blob"; blob: "token" | "presigned"; key: string; contentType: string }
  | { mode: "local"; key: string; contentType: string; uploadUrl: string; publicUrl: string };

async function send(body: Blob, folder: "posts" | "files", fileName: string): Promise<Uploaded> {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: body.type, size: body.size, folder, fileName }),
  });
  const prepared = (await res.json()) as Prepared & { error?: string };
  if (!res.ok) throw new Error(prepared.error ?? "업로드 준비에 실패했습니다.");

  if (prepared.mode === "blob") {
    // 브라우저 → Vercel Blob 직접 업로드 (토큰·서명 URL 은 같은 API 가 발급)
    const put = prepared.blob === "presigned" ? uploadPresigned : upload;
    const result = await put(prepared.key, body, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      contentType: prepared.contentType,
    });
    return { key: prepared.key, url: result.url, size: body.size };
  }

  const put = await fetch(prepared.uploadUrl, { method: "PUT", headers: { "Content-Type": prepared.contentType }, body });
  if (!put.ok) throw new Error("업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  return { key: prepared.key, url: prepared.publicUrl, size: body.size };
}

export async function uploadImage(file: File): Promise<Uploaded> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error("JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.");
  return send(await resize(file), "posts", file.name);
}

export async function uploadAttachment(file: File): Promise<Uploaded> {
  return send(file, "files", file.name);
}
