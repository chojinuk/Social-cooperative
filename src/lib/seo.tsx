import type { Metadata } from "next";
import { absoluteUrl, site } from "@/config/site";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
};

const abs = (src: string) => (src.startsWith("http") ? src : absoluteUrl(src));

/** 페이지별 메타데이터 (canonical · Open Graph · Twitter) — 모든 공개 페이지에서 사용 */
export function pageMetadata(p: PageSeo): Metadata {
  // SVG 는 검색·SNS 미리보기에서 표시되지 않으므로 기본 OG 이미지로 대체
  const image = p.image && !p.image.endsWith(".svg") ? abs(p.image) : absoluteUrl("/og-default.png");
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: {
      type: p.type ?? "website",
      locale: site.locale,
      siteName: site.name,
      url: p.path,
      title: `${p.title} | ${site.name}`,
      description: p.description,
      images: [{ url: image, width: 1200, height: 630, alt: p.title }],
      ...(p.type === "article" ? { publishedTime: p.publishedTime, modifiedTime: p.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: `${p.title} | ${site.name}`, description: p.description, images: [image] },
    ...(p.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": absoluteUrl("/#organization"),
  name: site.name,
  alternateName: site.nameEn,
  slogan: site.slogan,
  url: site.url,
  logo: absoluteUrl("/logo.png"),
  image: absoluteUrl("/og-default.png"),
  description: site.description,
  ...(site.foundingDate ? { foundingDate: site.foundingDate } : {}),
  telephone: site.contact.phone,
  faxNumber: site.contact.fax,
  email: site.contact.email,
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
    addressRegion: site.address.region,
    addressLocality: site.address.locality,
    streetAddress: site.address.street,
    ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
  },
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: site.name,
  alternateName: site.nameEn,
  url: site.url,
  inLanguage: "ko-KR",
  publisher: { "@id": absoluteUrl("/#organization") },
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "홈", path: "/" }, ...items].map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});

export const articleJsonLd = (a: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  datePublished: string;
  dateModified: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description,
  mainEntityOfPage: absoluteUrl(a.path),
  image: [a.image && !a.image.endsWith(".svg") ? abs(a.image) : absoluteUrl("/og-default.png")],
  datePublished: a.datePublished,
  dateModified: a.dateModified,
  author: { "@type": "Organization", name: site.name, url: site.url },
  publisher: { "@id": absoluteUrl("/#organization") },
  inLanguage: "ko-KR",
});
