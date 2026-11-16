import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { internalPaths } from "@/config/menu";
import { policies } from "@/content/policies";
import { getPostIndex } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostIndex();
  const latest = posts[0]?.updatedAt;
  const isNews = (p: string) => p.startsWith("/news");

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1, ...(latest ? { lastModified: latest } : {}) },
    ...internalPaths().map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: (isNews(path) ? "daily" : "monthly") as "daily" | "monthly",
      priority: isNews(path) ? 0.7 : 0.8,
      ...(isNews(path) && latest ? { lastModified: latest } : {}),
    })),
    ...policies.map((p) => ({ url: absoluteUrl(`/policy/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/news/${p.boardType}/${p.id}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
