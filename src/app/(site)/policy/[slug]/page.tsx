import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubPage } from "@/components/layout/SubPage";
import { site } from "@/config/site";
import { findPolicy, policies } from "@/content/policies";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policy/[slug]">): Promise<Metadata> {
  const p = findPolicy((await params).slug);
  if (!p) return {};
  return pageMetadata({ title: p.title, description: `${site.name} ${p.title}`, path: `/policy/${p.slug}` });
}

/** 푸터 약관 — 모달과 같은 내용을 검색엔진·JS 꺼진 환경용 정적 페이지로도 제공 */
export default async function Page({ params }: PageProps<"/policy/[slug]">) {
  const p = findPolicy((await params).slug);
  if (!p) notFound();
  return (
    <SubPage path={`/policy/${p.slug}`} title={p.title}>
      <div className="WCMSSwr policy_body">
        <p>{p.body}</p>
      </div>
    </SubPage>
  );
}
