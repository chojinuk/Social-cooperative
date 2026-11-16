/**
 * 메인 페이지 구성 (레퍼런스 메인과 같은 순서: 공백 → 슬라이드 → 사업 카드 4개 → 최신글 3단 → 점선 → 배너 4개)
 * TODO(운영 전 교체): 이미지·문구는 자리표시자. 같은 크기 비율의 이미지로 바꾸세요.
 *  - 슬라이드 900×400 · 사업 카드 400×202 · 배너 550×174
 */
export const heroSlides = [
  { image: "/placeholder/hero-1.svg", alt: "조합 활동 대표 사진", caption: true },
  { image: "/placeholder/hero-2.svg", alt: "마을 활동 사진", caption: false },
];

export const businessCards = [
  { title: "사업 1 (예: 복지관 운영)", text: "사업 1 위탁운영 안내", href: "/business/business-1", image: "/placeholder/card-1.svg" },
  { title: "사업 2 (예: 방과후마을학교)", text: "아이들이 서로 배우며 함께 자라는 공간", href: "/business/business-2", image: "/placeholder/card-2.svg" },
  { title: "사업 3 (예: 활동지원사업)", text: "필요한 분께 꼭 맞는 지원을", href: "/business/business-3", image: "/placeholder/card-3.svg" },
  { title: "조합 정관", text: "0000.00.00 변경인가", href: "/about/articles", image: "/placeholder/card-4.svg" },
];

/** 관련기관 배너 (새 창) */
export const banners = [
  { label: "국세청", href: "https://www.nts.go.kr/", image: "/placeholder/banner-1.svg" },
  { label: "기획재정부 협동조합", href: "https://www.coop.go.kr/", image: "/placeholder/banner-2.svg" },
  { label: "한국사회적기업진흥원", href: "https://www.socialenterprise.or.kr/", image: "/placeholder/banner-3.svg" },
  { label: "교육부", href: "https://www.moe.go.kr/", image: "/placeholder/banner-4.svg" },
];
