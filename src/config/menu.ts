/**
 * 메뉴 정의 — 메뉴가 바뀌면 이 파일만 수정하면
 * 상단 메뉴(GNB)·모바일 메뉴·서브페이지 좌측 메뉴·위치 표시·서브 배너·사이트맵에 모두 반영됩니다.
 * 구성은 레퍼런스(woorimodoo.or.kr)와 같은 6개 1차 메뉴. 명칭은 자리표시자.
 */
export type MenuChild = { label: string; href: string; external?: boolean };
export type MenuItem = {
  label: string;
  href: string;
  children: MenuChild[];
  /** 서브 상단 배너 배경 (1920×500) */
  banner: string;
  /** 외부 링크 모음 — 서브페이지가 없고 사이트맵에서 제외 */
  externalOnly?: boolean;
};

export const mainMenu: MenuItem[] = [
  {
    label: "조합소개",
    href: "/about/greeting",
    banner: "/placeholder/sub-1.svg",
    children: [
      { label: "인사말", href: "/about/greeting" },
      { label: "조직", href: "/about/organization" },
      { label: "연혁", href: "/about/history" },
      { label: "정관", href: "/about/articles" },
      { label: "오시는길", href: "/about/location" },
    ],
  },
  {
    label: "사업소개",
    href: "/business/business-1",
    banner: "/placeholder/sub-2.svg",
    children: [
      { label: "사업 1 (예: 복지관 위탁운영)", href: "/business/business-1" },
      { label: "사업 2 (예: 방과후마을학교)", href: "/business/business-2" },
      { label: "사업 3 (예: 활동지원사업)", href: "/business/business-3" },
    ],
  },
  {
    label: "조합소식",
    href: "/news/notice",
    banner: "/placeholder/sub-3.svg",
    children: [
      { label: "공지사항", href: "/news/notice" },
      { label: "조합이야기", href: "/news/story" },
      { label: "상담 및 제안", href: "/contact" },
    ],
  },
  {
    label: "후원안내",
    href: "/support",
    banner: "/placeholder/sub-4.svg",
    children: [{ label: "후원안내", href: "/support" }],
  },
  {
    label: "협력기관",
    href: "/partners/partner-1",
    banner: "/placeholder/sub-5.svg",
    children: [
      { label: "협력기관 1", href: "/partners/partner-1" },
      { label: "협력기관 2", href: "/partners/partner-2" },
      { label: "협력기관 3", href: "/partners/partner-3" },
    ],
  },
  {
    label: "관련기관",
    href: "https://www.nts.go.kr/",
    banner: "/placeholder/sub-6.svg",
    externalOnly: true,
    children: [
      { label: "국세청", href: "https://www.nts.go.kr/", external: true },
      { label: "국민권익위원회", href: "https://www.acrc.go.kr/", external: true },
      { label: "교육부", href: "https://www.moe.go.kr/", external: true },
    ],
  },
];

/** 현재 경로가 속한 1차·2차 메뉴 (서브페이지 좌측 메뉴·위치 표시·배너용) */
export function findSection(pathname: string) {
  for (const [index, section] of mainMenu.entries()) {
    if (section.externalOnly) continue;
    const child = section.children
      .filter((c) => !c.external && (pathname === c.href || pathname.startsWith(c.href + "/")))
      .sort((a, b) => b.href.length - a.href.length)[0];
    if (child) return { section, child, index };
  }
  return null;
}

/** 사이트맵용 내부 경로 */
export function internalPaths() {
  return mainMenu.flatMap((m) => m.children.filter((c) => !c.external).map((c) => c.href));
}
