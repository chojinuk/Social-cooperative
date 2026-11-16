import type { Metadata } from "next";
import { StaticPage, staticPageMetadata } from "@/components/content/StaticPage";
import { slugsUnder } from "@/content/pages";

// 검색엔진에 완성된 HTML·정확한 404 상태를 주기 위해 URL 값을 기다려 서버에서 완전히 렌더링
export const instant = false;

export function generateStaticParams() {
  return slugsUnder("/partners").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/partners/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return staticPageMetadata(`/partners/${slug}`);
}

export default async function Page({ params }: PageProps<"/partners/[slug]">) {
  const { slug } = await params;
  return <StaticPage path={`/partners/${slug}`} />;
}
