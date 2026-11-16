"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * 스크롤 2px 이상이면 <html class="scDown"> — 원본처럼 PC 헤더의 유틸 막대가 접히고(116→81px)
 * 우측 하단 "위로" 버튼이 올라온다.
 */
export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => root.classList.toggle("scDown", window.scrollY >= 2);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      root.classList.remove("scDown");
    };
  }, []);

  return (
    <button type="button" id="top_btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <Icon name="angleUp" />
      <span className="sound_only">페이지 상단으로 이동</span>
    </button>
  );
}
