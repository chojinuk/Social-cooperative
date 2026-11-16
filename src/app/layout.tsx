import type { Metadata, Viewport } from "next";
import { site } from "@/config/site";
import "./globals.css";

const naver = process.env.NAVER_SITE_VERIFICATION;
const google = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: "/",
    title: site.title,
    description: site.description,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og-default.png"] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    ...(google ? { google } : {}),
    ...(naver ? { other: { "naver-site-verification": naver } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        {/* Noto Sans KR (OFL) 자체 호스팅 — 레퍼런스 디자인의 본문 글꼴. 400·700 두 굵기, 쓰인 글자 범위만 내려받음 */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/fonts/noto-sans-kr/noto-sans-kr.css" />
        <link rel="alternate" type="application/rss+xml" title={`${site.name} 소식`} href="/rss.xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
