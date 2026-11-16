import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // 검색엔진 수집기(네이버 Yeti, 다음, 구글 등)에는 스트리밍 없이
  // 완성된 HTML 한 덩어리를 보내도록 한다. (기본 목록을 덮어쓰므로 기본 봇도 포함)
  htmlLimitedBots:
    /Yeti|NaverBot|Daum|Daumoa|Googlebot|Google-InspectionTool|Mediapartners-Google|AdsBot-Google|Google-PageRenderer|bingbot|Bingbot|Yandex|Baiduspider|DuckDuckBot|Slurp|facebookexternalhit|Twitterbot|Slackbot|kakaotalk-scrap|Kakao|LinkedInBot|Discordbot|TelegramBot/i,

  serverExternalPackages: ["@electric-sql/pglite"],

  images: {
    formats: ["image/avif", "image/webp"],
    // 업로드 이미지는 Vercel Blob 공개 URL 에서 서빙 (로컬은 /uploads/* — 같은 출처라 설정 불필요)
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },

  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  async redirects() {
    // 1차 메뉴 루트 → 첫 하위 페이지 (src/config/menu.ts 와 맞춤)
    return [
      { source: "/about", destination: "/about/greeting", statusCode: 301 },
      { source: "/business", destination: "/business/business-1", statusCode: 301 },
      { source: "/news", destination: "/news/notice", statusCode: 301 },
      { source: "/partners", destination: "/partners/partner-1", statusCode: 301 },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
