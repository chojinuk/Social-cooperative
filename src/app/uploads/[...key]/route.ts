import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { contentTypeForKey, isSafeKey, LOCAL_UPLOAD_DIR } from "@/lib/storage";

/** 로컬 개발용 업로드 파일 서빙 (운영에서는 Vercel Blob URL 사용) */
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  if (!isSafeKey(key)) return new NextResponse(null, { status: 404 });
  try {
    const data = await readFile(path.join(LOCAL_UPLOAD_DIR, key));
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeForKey(key),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
