import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPage } from "@/components/layout/SubPage";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { ContentBlocks } from "./ContentBlocks";

/** src/content/pages.ts 의 한 페이지를 서브페이지 틀에 넣어 그린다 */
export function StaticPage({ path }: { path: string }) {
  const page = pages[path];
  if (!page) notFound();
  return (
    <SubPage path={path} title={page.title}>
      <ContentBlocks blocks={page.blocks} />
    </SubPage>
  );
}

export function staticPageMetadata(path: string): Metadata {
  const page = pages[path];
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path });
}
