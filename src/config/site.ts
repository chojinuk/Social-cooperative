/**
 * 사이트 공통 정보 — 단체명·연락처·주소가 바뀌면 이 파일만 수정하면
 * 헤더·푸터·모바일 메뉴·메인 상담 위젯·오시는 길·JSON-LD·RSS 에 모두 반영됩니다.
 *
 * TODO(운영 전 교체): 아래 값은 모두 자리표시자입니다.
 */
export const site = {
  name: "○○사회적협동조합",
  nameEn: "OO Social Cooperative",
  /** 메인 히어로 문구 */
  slogan: "함께 자라는 아이, 함께 키우는 부모, 함께 사는 마을",
  title: "○○사회적협동조합",
  description:
    "○○사회적협동조합은 지역 주민과 조합원이 함께 돌봄·교육·복지 사업을 운영하는 사회적협동조합입니다. 공지사항, 조합 소식, 사업 안내와 상담·제안 창구를 제공합니다.",
  keywords: ["○○사회적협동조합", "사회적협동조합", "협동조합", "마을공동체", "공동육아", "방과후마을학교", "지역사회복지"],
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://example.or.kr").replace(/\/$/, ""),
  locale: "ko_KR",
  /** 브라우저 주소창 색 · 사이트 주조색 (globals.css --color-theme 과 같은 값) */
  themeColor: "#1192a2",
  foundingDate: "",
  contact: {
    phone: "000-0000-0000",
    fax: "000-000-0000",
    email: "contact@example.or.kr",
  },
  address: {
    full: "○○도 ○○시 ○○구 ○○로 00, 0층",
    region: "○○도",
    locality: "○○시",
    street: "○○로 00, 0층",
    postalCode: "",
  },
  /** 오시는 길 지도 (구글 지도 embed 주소 · 네이버 지도 길찾기 주소) */
  map: {
    embedUrl: "https://www.google.com/maps?q=%EC%84%9C%EC%9A%B8%EC%8B%9C%EC%B2%AD&output=embed",
    naverUrl: "https://map.naver.com/",
  },
  /** 회원 로그인·회원가입·조합원게시판 — 이번 범위에서 제외 (켜면 유틸 메뉴에 링크가 다시 나타남) */
  features: { memberAuth: false },
} as const;

export const absoluteUrl = (path = "/") => `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
