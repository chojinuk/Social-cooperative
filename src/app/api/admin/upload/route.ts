import { issueSignedToken } from "@vercel/blob";
import { handleUpload, handleUploadPresigned, type HandleUploadBody, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { blobMode, contentTypeForKey, extFor, isSafeKey, MAX_BYTES, newKey, UPLOAD_FOLDERS, type UploadFolder } from "@/lib/storage";

/**
 * 업로드 준비 (관리자 전용)
 * 1) { folder, contentType, size, fileName } → 저장 키 발급 + 모드("blob" | "local") 응답
 * 2) Blob 모드: 브라우저가 같은 주소로 다시 요청
 *    - token: @vercel/blob/client 의 upload() → handleUpload 가 검증 후 클라이언트 토큰 발급
 *    - presigned: uploadPresigned() → handleUploadPresigned 가 검증 후 서명된 업로드 URL 발급 (OIDC)
 */
const folderOf = (key: string) => key.split("/")[0] as UploadFolder;
const uploadRules = (key: string) => ({
  allowedContentTypes: [contentTypeForKey(key), "application/octet-stream"],
  maximumSizeInBytes: MAX_BYTES[folderOf(key)],
  validUntil: Date.now() + 5 * 60 * 1000,
});

export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { contentType?: string; size?: number; folder?: string; fileName?: string }
    | HandleUploadBody
    | HandleUploadPresignedBody
    | null;
  if (!body) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  // 2) Blob 업로드 권한 교환 — 키는 1) 에서 우리가 만든 것만 허용 (임의 경로·덮어쓰기 차단)
  if ("type" in body) {
    const mode = blobMode();
    if (!mode) return NextResponse.json({ error: "저장소가 설정되지 않았습니다." }, { status: 400 });
    try {
      if (body.type === "blob.generate-presigned-url") {
        if (mode !== "presigned") throw new Error("잘못된 요청입니다.");
        const json = await handleUploadPresigned({
          body,
          request,
          getSignedToken: async (pathname) => {
            if (!isSafeKey(pathname)) throw new Error("잘못된 저장 경로입니다.");
            const rules = uploadRules(pathname);
            const token = await issueSignedToken({ pathname, operations: ["put"], ...rules });
            return { token, urlOptions: { ...rules, addRandomSuffix: false, allowOverwrite: false } };
          },
        });
        return NextResponse.json(json);
      }
      if (mode !== "token") throw new Error("잘못된 요청입니다.");
      const json = await handleUpload({
        body: body as HandleUploadBody,
        request,
        onBeforeGenerateToken: async (pathname) => {
          if (!isSafeKey(pathname)) throw new Error("잘못된 저장 경로입니다.");
          return { ...uploadRules(pathname), addRandomSuffix: false, allowOverwrite: false };
        },
      });
      return NextResponse.json(json);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "업로드 준비에 실패했습니다." }, { status: 400 });
    }
  }

  // 1) 키 발급
  const folder = body.folder as UploadFolder;
  if (!UPLOAD_FOLDERS.includes(folder)) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  const ext = extFor(folder, body.contentType ?? "", body.fileName);
  if (!ext) {
    const msg = folder === "posts" ? "JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다." : "PDF·한글·워드·엑셀·파워포인트·ZIP·이미지 파일만 첨부할 수 있습니다.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const max = MAX_BYTES[folder];
  if (!body.size || body.size > max) {
    return NextResponse.json({ error: `파일은 ${max / 1024 / 1024}MB 이하만 올릴 수 있습니다.` }, { status: 400 });
  }
  const key = newKey(folder, ext);
  const mode = blobMode();
  if (mode) return NextResponse.json({ mode: "blob", blob: mode, key, contentType: contentTypeForKey(key) });
  return NextResponse.json({
    mode: "local",
    key,
    contentType: contentTypeForKey(key),
    uploadUrl: `/api/admin/upload/local?key=${encodeURIComponent(key)}`,
    publicUrl: `/uploads/${key}`,
  });
}
