import Link from "next/link";
import { findSection, mainMenu } from "@/config/menu";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { SideBar } from "./SideBar";
import { SubTopLocNav } from "./SubTopLocNav";

/**
 * 서브페이지 틀 (원본 #page_title + .subTopLocNav + #ctWrap[#container + #sideBar])
 * - path 로 1차·2차 메뉴를 찾아 배너 이미지·좌측 메뉴·위치 표시를 정한다 (src/config/menu.ts)
 * - 제목(.contentTitle)은 기본 h1. 게시글 상세처럼 본문에 h1 이 따로 있으면 titleAs="p"
 * - 위치(브레드크럼)는 BreadcrumbList JSON-LD 로도 출력
 */
export function SubPage({
  path,
  title,
  titleAs = "h1",
  crumbs = [],
  children,
}: {
  path: string;
  title: string;
  titleAs?: "h1" | "p";
  /** 2차 메뉴 아래 단계 (예: 게시글 제목) */
  crumbs?: { name: string; path: string }[];
  children: React.ReactNode;
}) {
  const found = findSection(path);
  const section = found?.section;
  const child = found?.child;
  const banner = section?.banner ?? mainMenu[0].banner;
  const trail = [
    ...(section ? [{ name: section.label, path: section.href }] : []),
    ...(child && child.label !== section?.label ? [{ name: child.label, path: child.href }] : []),
    ...crumbs,
  ];
  const Title = titleAs;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <div id="page_title" style={{ backgroundImage: `url(${banner})` }}>
        <div className="page_title_in">
          <div className="page_title_h">
            <strong aria-hidden="true">{child?.label ?? title}</strong>
            <span className="titleBbar" />
          </div>
        </div>
      </div>
      {section && child && <SubTopLocNav menu={mainMenu} section={section} child={child} />}

      <div id="ctWrap">
        <div id="container">
          <div className="contentTitle">
            <Title className="ct_h">{title}</Title>
            <nav className="locationBar" aria-label="현재 위치">
              <ol>
                <li>
                  <Link href="/">HOME</Link>
                </li>
                {trail.map((t, i) => (
                  <li key={t.path + i}>
                    {i === trail.length - 1 ? <span aria-current="page">{t.name}</span> : <Link href={t.path}>{t.name}</Link>}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          {children}
        </div>
        <SideBar />
      </div>
    </>
  );
}
