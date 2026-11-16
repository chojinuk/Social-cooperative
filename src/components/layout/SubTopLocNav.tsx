"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuChild, MenuItem } from "@/config/menu";
import { Icon } from "@/components/ui/Icon";

/** 모바일 서브 상단: 배너에 걸친 1차/2차 메뉴 드롭다운 두 개 (원본 .subTopLocNav · 981px 이상에서는 숨김) */
export function SubTopLocNav({ menu, section, child }: { menu: MenuItem[]; section: MenuItem; child: MenuChild }) {
  const [open, setOpen] = useState<0 | 1 | 2>(0);
  const single = section.children.length <= 1;
  const toggle = (n: 1 | 2) => setOpen((v) => (v === n ? 0 : n));

  return (
    <nav className={`subTopLocNav${single ? " single" : ""}`} aria-label="현재 위치 메뉴">
      <button type="button" className={`locBtn${open === 1 ? " on" : ""}`} aria-expanded={open === 1} onClick={() => toggle(1)}>
        <b>{section.label}</b>
        <Icon name="angleDown" />
        <u />
      </button>
      {!single && (
        <button type="button" className={`locBtn${open === 2 ? " on" : ""}`} aria-expanded={open === 2} onClick={() => toggle(2)}>
          <b>{child.label}</b>
          <Icon name="angleDown" />
          <u />
        </button>
      )}
      <div className={`bNBar bNBar1D${open === 1 ? " on" : ""}`}>
        <ul>
          {menu
            .filter((m) => !m.externalOnly)
            .map((m) => (
              <li key={m.label} className={m.label === section.label ? "active" : undefined}>
                <Link href={m.href}>{m.label}</Link>
              </li>
            ))}
        </ul>
      </div>
      {!single && (
        <div className={`bNBar bNBar2D${open === 2 ? " on" : ""}`}>
          <ul>
            {section.children.map((c) => (
              <li key={c.href} className={c.href === child.href ? "active" : undefined}>
                <Link href={c.href}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
