"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { findSection, mainMenu } from "@/config/menu";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";

/**
 * 원본 #sideBar 하나가 두 역할을 한다.
 * - PC(981px 이상) 서브페이지: 본문 왼쪽 20% 메뉴 — 현재 1차 메뉴만, 주조색 제목 상자 + 2차 메뉴 + CONTACT
 * - 모바일(980px 이하): 햄버거(#snbOpen)로 여는 오른쪽 280px 서랍 — 전체 메뉴 아코디언
 */
export function SideBar() {
  const pathname = usePathname();
  const current = findSection(pathname);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<string | null>(current?.section.label ?? null);
  const [lastPath, setLastPath] = useState(pathname);

  // 페이지를 옮기면 서랍을 닫고, 아코디언은 현재 메뉴만 펼친다
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setShown(current?.section.label ?? null);
  }

  useEffect(() => {
    document.documentElement.classList.toggle("ovfH", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" id="snbOpen" aria-expanded={open} aria-controls="sideBar" onClick={() => setOpen((v) => !v)}>
        <b>
          <i />
          <i />
          <i />
        </b>
        <span className="sound_only">전체 메뉴 {open ? "닫기" : "열기"}</span>
      </button>
      <button type="button" id="sideBarCover" className={open ? "on" : ""} tabIndex={-1} aria-hidden="true" onClick={() => setOpen(false)} />

      <aside id="sideBar" className={open ? "on" : ""} aria-label="전체 메뉴">
        <ul id="snb">
          {mainMenu.map((m) => {
              const active = current?.section.label === m.label;
              const isShown = shown === m.label;
              return (
                <li key={m.label} className={`snb${active ? " active" : ""}${isShown ? " show" : ""}`}>
                  <h2>
                    {m.externalOnly ? (
                      // 관련기관처럼 외부 링크만 있는 메뉴는 제목을 눌러도 펼치기만 함
                      <a href="#" onClick={(e) => { e.preventDefault(); setShown(isShown ? null : m.label); }}>
                        <b>{m.label}</b>
                        <sub />
                      </a>
                    ) : (
                      <Link href={m.href}>
                        <b>{m.label}</b>
                        <sub />
                      </Link>
                    )}
                  </h2>
                  <button
                    type="button"
                    className="snb2dDown"
                    aria-expanded={isShown}
                    onClick={() => setShown(isShown ? null : m.label)}
                  >
                    <span>
                      <Icon name="angleDown" />
                    </span>
                    <span className="sound_only">
                      {m.label} 하위 메뉴 {isShown ? "접기" : "펼치기"}
                    </span>
                  </button>
                  <ul>
                    {m.children.map((c) => (
                      <li key={c.href} className={`snb2d${current?.child.href === c.href ? " active" : ""}`}>
                        {c.external ? (
                          <a href={c.href} target="_blank" rel="noopener noreferrer">
                            <b>{c.label}</b>
                          </a>
                        ) : (
                          <Link href={c.href} aria-current={current?.child.href === c.href ? "page" : undefined}>
                            <b>{c.label}</b>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              );
          })}
        </ul>

        <dl className="snbCS">
          <dt>CONTACT</dt>
          <dd>
            <strong>
              <Icon name="phone" /> {site.contact.phone}
            </strong>
            <b>FAX: {site.contact.fax}</b>
            <b>
              E-mail: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </b>
          </dd>
        </dl>

        <div id="snbMvAr">
          <div className="snbMvArBtn">
            <Link href="/">
              <Icon name="home" />
              <span className="sound_only">메인페이지로 이동</span>
            </Link>
            <Link href="/contact">
              <b>상담 및 제안</b>
            </Link>
            <Link href="/about/location">
              <b>오시는길</b>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
