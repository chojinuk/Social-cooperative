import { site } from "@/config/site";

/**
 * 정적 페이지 내용 — 레퍼런스의 섹션 빌더(WCMSS)처럼 블록을 위에서 아래로 쌓는다.
 * 경로(key)는 src/config/menu.ts 의 2차 메뉴 주소와 같아야 한다.
 * TODO(운영 전 교체): 모든 문구·이미지는 자리표시자입니다.
 *
 * 블록 종류
 *  - text    : 제목(선택) + 본문(줄바꿈 \n) + 이미지(선택, 좌·우·가운데) · size 1~3 은 원본 contTxt1~3 글자 크기
 *  - title   : 굵은 소제목 (원본 .h2_title — 왼쪽 주조색 막대)
 *  - info    : 점선 상자 안내문 (원본 .cont_text_info)
 *  - table   : 기본 표 (원본 .basic_table)
 *  - cards   : 2~4열 카드 (메인 사업 카드와 같은 모양)
 *  - blank   : 공백 또는 점선 구분
 *  - button  : 둥근 버튼 (원본 WCMSScontButtonOutside)
 *  - map     : 지도 + 주소 + 네이버 길찾기
 *  - history : 연혁 표 (src/content/history.ts)
 */
export type Block =
  | {
      type: "text";
      title?: string;
      body?: string;
      image?: { src: string; alt: string; width: number; height: number; align: "left" | "right" | "center" };
      align?: "left" | "center";
      size?: 1 | 2 | 3;
    }
  | { type: "title"; text: string }
  | { type: "info"; body: string }
  | { type: "table"; head?: string[]; rows: string[][] }
  | { type: "cards"; cols: 2 | 3 | 4; items: { title: string; body: string; image?: string; href?: string }[] }
  | { type: "blank"; height?: number; dashed?: boolean }
  | { type: "button"; label: string; href: string; external?: boolean }
  | { type: "map"; title: string; address: string; tel?: string; embedUrl: string; naverUrl: string }
  | { type: "history" };

export type ContentPage = { title: string; description: string; blocks: Block[] };

const ph = (n: number) => `/placeholder/content-${n}.svg`;

export const pages: Record<string, ContentPage> = {
  "/about/greeting": {
    title: "인사말",
    description: `${site.name} 이사장 인사말입니다. 조합원과 이웃이 협동으로 행복한 마을을 만들어 갑니다.`,
    blocks: [
      {
        type: "text",
        size: 2,
        image: { src: "/placeholder/greeting.svg", alt: "이사장 사진", width: 400, height: 500, align: "right" },
        body: `“혼자보다는 둘이 더 낫다. 두 사람이 함께 일할 때 더 좋은 결과를 얻을 수 있기 때문이다.”
여기에 인사말 첫 문단을 입력하세요.

우리 조합은 조합원과 지역 주민이 서로 마음과 힘을 합하는 협동조합입니다.
모인 사람들끼리만이 아니라, 우리가 사는 지역사회 전체와 협동하는 ‘사회적협동조합’입니다.

먼저 조합원들과 협동하겠습니다. 조합원의 풍요로운 삶을 위해 서로 마음과 힘을 합하겠습니다.
협동을 통해 커진 힘은 이웃과 마을을 향해 쓰일 것입니다.

아이들이 이 세상의 주인으로 당당하게 살아갈 수 있도록, 부모와 가족, 마을 주민이 함께 협동의 축을 이루겠습니다.

여기에 인사말 마지막 문단을 입력하세요. 함께 마음과 힘을 모아 주실 모든 분들을 기대하고 환영합니다.`,
      },
      { type: "text", size: 3, align: "center", title: "“함께하면 더 낫습니다”" },
      { type: "blank", height: 30 },
      { type: "text", size: 1, align: "center", body: `${site.name} 이사장 ○○○` },
    ],
  },
  "/about/organization": {
    title: "조직",
    description: `${site.name}의 조직 구성과 담당 업무를 안내합니다.`,
    blocks: [
      { type: "text", align: "center", image: { src: "/placeholder/organization.svg", alt: `${site.name} 조직도`, width: 900, height: 500, align: "center" } },
      { type: "blank", height: 30 },
      { type: "title", text: "부서별 업무" },
      {
        type: "table",
        head: ["구분", "담당 업무", "연락처"],
        rows: [
          ["총회", "조합 최고 의결기구 · 정관 변경, 예산·결산 승인", "-"],
          ["이사회", "주요 업무 집행 의결", "-"],
          ["사무국", "조합 운영 전반, 조합원 관리, 회계", site.contact.phone],
          ["사업단 1", "사업 1 운영", "000-0000-0000"],
          ["사업단 2", "사업 2 운영", "000-0000-0000"],
        ],
      },
    ],
  },
  "/about/history": {
    title: "연혁",
    description: `${site.name}이 걸어온 길을 연도별로 안내합니다.`,
    blocks: [{ type: "history" }],
  },
  "/about/articles": {
    title: "정관",
    description: `${site.name} 정관 안내 — 목적, 조합원, 기관, 사업 등 조합 운영의 기본 규칙입니다.`,
    blocks: [
      { type: "info", body: `${site.name} 정관은 0000년 00월 00일 변경 인가되었습니다.\n정관 전문은 아래 버튼으로 내려받을 수 있습니다.` },
      { type: "title", text: "제1장 총칙" },
      { type: "text", body: "제1조(명칭) 이 조합은 ○○사회적협동조합이라 한다.\n제2조(목적) 이 조합은 …을 목적으로 한다.\n제3조(사무소의 소재지) 조합의 주된 사무소는 ○○도 ○○시에 둔다." },
      { type: "title", text: "제2장 조합원" },
      { type: "text", body: "제10조(조합원의 자격) 조합의 설립 목적에 동의하고 조합원으로서의 의무를 다하고자 하는 자는 조합원이 될 수 있다.\n제11조(조합원의 종류) 조합원은 생산자, 소비자, 직원, 자원봉사자, 후원자 조합원으로 구분한다." },
      { type: "title", text: "제3장 기관" },
      { type: "text", body: "제40조(총회) 조합은 총회를 둔다.\n제50조(이사회) 조합은 이사회를 둔다." },
      { type: "button", label: "정관 전문 내려받기 (PDF)", href: "/placeholder/sample-attachment.pdf", external: true },
    ],
  },
  "/about/location": {
    title: "오시는길",
    description: `${site.name} 찾아오시는 길 — 주소와 연락처, 지도를 안내합니다.`,
    blocks: [
      {
        type: "map",
        title: "본점",
        address: site.address.full,
        tel: `TEL : ${site.contact.phone} / FAX : ${site.contact.fax} / E-mail : ${site.contact.email}`,
        embedUrl: site.map.embedUrl,
        naverUrl: site.map.naverUrl,
      },
    ],
  },
  "/business/business-1": {
    title: "사업 1 (예: 복지관 위탁운영)",
    description: `${site.name} 사업 1 안내 — 사업 목적과 주요 프로그램을 소개합니다.`,
    blocks: [
      { type: "text", size: 2, image: { src: ph(1), alt: "사업 1 사진", width: 600, height: 400, align: "right" }, title: "사업 소개", body: "사업 1의 목적과 내용을 입력하세요.\n\n지역 주민 누구나 이용할 수 있는 복지 서비스를 제공합니다.\n가족·아동·청소년·어르신을 위한 다양한 프로그램을 운영합니다." },
      { type: "blank", dashed: true },
      {
        type: "cards",
        cols: 3,
        items: [
          { title: "프로그램 1", body: "프로그램 설명을 입력하세요.", image: ph(2) },
          { title: "프로그램 2", body: "프로그램 설명을 입력하세요.", image: ph(3) },
          { title: "프로그램 3", body: "프로그램 설명을 입력하세요.", image: ph(4) },
        ],
      },
    ],
  },
  "/business/business-2": {
    title: "사업 2 (예: 방과후마을학교)",
    description: `${site.name} 사업 2 안내 — 아이들이 함께 배우며 자라는 방과후마을학교입니다.`,
    blocks: [
      { type: "text", size: 2, image: { src: ph(2), alt: "사업 2 사진", width: 600, height: 400, align: "right" }, title: "사업 소개", body: "사업 2의 목적과 내용을 입력하세요.\n\n형·누나·동생들과 어울리며 서로 배우는 마을학교입니다.\n놀이와 배움이 함께하는 일과를 운영합니다." },
      { type: "title", text: "운영 안내" },
      {
        type: "table",
        rows: [
          ["대상", "초등학생"],
          ["운영 시간", "평일 00:00 ~ 00:00"],
          ["장소", "조합 마을학교"],
          ["문의", site.contact.phone],
        ],
      },
      { type: "button", label: "상담 및 제안 바로가기", href: "/contact" },
    ],
  },
  "/business/business-3": {
    title: "사업 3 (예: 활동지원사업)",
    description: `${site.name} 사업 3 안내 — 꼭 필요한 분께 꼭 맞는 지원을 제공합니다.`,
    blocks: [
      { type: "text", size: 2, image: { src: ph(3), alt: "사업 3 사진", width: 600, height: 400, align: "right" }, title: "사업 소개", body: "사업 3의 목적과 내용을 입력하세요.\n\n활동지원사를 통해 일상생활과 사회활동을 지원합니다." },
      { type: "info", body: "신청 방법: 주민센터 신청 → 자격 심사 → 기관 선택 → 서비스 시작\n자세한 내용은 사무국으로 문의해 주세요." },
    ],
  },
  "/support": {
    title: "후원안내",
    description: `${site.name} 후원 안내 — 정기·일시 후원 방법과 기부금 영수증 발급을 안내합니다.`,
    blocks: [
      { type: "text", size: 2, align: "center", title: "함께 키우는 마을, 여러분의 후원으로 시작됩니다", body: "보내 주신 후원금은 장학금과 마을 아이들을 위한 활동에 소중히 쓰입니다." },
      { type: "blank", dashed: true },
      { type: "title", text: "후원 방법" },
      {
        type: "table",
        rows: [
          ["정기 후원", "매월 원하는 금액을 자동이체로 후원"],
          ["일시 후원", "원하실 때 원하는 금액을 후원"],
          ["후원 계좌", "○○은행 000-0000-0000-00 (예금주: ○○사회적협동조합)"],
        ],
      },
      { type: "info", body: "기부금 영수증이 필요하신 분은 성함·연락처·주민등록번호(영수증 발급용)를 사무국으로 알려 주세요.\n연말정산 간소화 서비스에 반영됩니다." },
      { type: "button", label: "후원 문의하기", href: "/contact" },
    ],
  },
  "/partners/partner-1": {
    title: "협력기관 1",
    description: `${site.name} 협력기관 1을 소개합니다.`,
    blocks: [
      { type: "text", size: 2, image: { src: ph(4), alt: "협력기관 1 사진", width: 600, height: 400, align: "right" }, title: "협력기관 1", body: "협력기관 소개 문구를 입력하세요.\n\n주소: ○○시 ○○로 00\n전화: 000-0000-0000" },
      { type: "button", label: "홈페이지 바로가기", href: "https://example.com/", external: true },
    ],
  },
  "/partners/partner-2": {
    title: "협력기관 2",
    description: `${site.name} 협력기관 2를 소개합니다.`,
    blocks: [
      { type: "text", size: 2, image: { src: ph(5), alt: "협력기관 2 사진", width: 600, height: 400, align: "right" }, title: "협력기관 2", body: "협력기관 소개 문구를 입력하세요.\n\n주소: ○○시 ○○로 00\n전화: 000-0000-0000" },
      { type: "button", label: "홈페이지 바로가기", href: "https://example.com/", external: true },
    ],
  },
  "/partners/partner-3": {
    title: "협력기관 3",
    description: `${site.name} 협력기관 3을 소개합니다.`,
    blocks: [
      { type: "text", size: 2, image: { src: ph(6), alt: "협력기관 3 사진", width: 600, height: 400, align: "right" }, title: "협력기관 3", body: "협력기관 소개 문구를 입력하세요.\n\n주소: ○○시 ○○로 00\n전화: 000-0000-0000" },
      { type: "button", label: "홈페이지 바로가기", href: "https://example.com/", external: true },
    ],
  },
};

/** 주어진 1단계 경로(/about 등) 아래의 slug 목록 — generateStaticParams 용 */
export function slugsUnder(prefix: string) {
  return Object.keys(pages)
    .filter((p) => p.startsWith(`${prefix}/`))
    .map((p) => p.slice(prefix.length + 1));
}
