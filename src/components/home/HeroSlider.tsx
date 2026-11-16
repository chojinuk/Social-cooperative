"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { heroSlides } from "@/content/home";

const PAUSE = 6000; // 원본 bxSlider pause:6000

/**
 * 메인 슬라이드 — 원본 bxSlider(mode:fade, auto, pager, stopAutoOnClick) 동작을 라이브러리 없이 재현.
 * 첫 슬라이드의 문구는 위·아래에서 모이며 나타난다(.on). 페이저를 누르면 자동 넘김을 멈춘다.
 */
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [on, setOn] = useState(false);
  const [auto, setAuto] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 처음 그린 뒤 문구 등장 (원본 onSliderLoad 에서 .on)
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!auto || heroSlides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setTimeout(() => go((index + 1) % heroSlides.length), PAUSE);
    return () => clearTimeout(timer.current);
  }, [index, auto]);

  function go(n: number) {
    // 원본 onSlideBefore/After: 넘기는 동안 .on 을 떼었다가 다시 붙여 문구가 다시 모이게 함
    setOn(false);
    setIndex(n);
    setTimeout(() => setOn(true), 500);
  }

  return (
    <section className="WCMSSwr WCMSScontSlideOutside" aria-roledescription="carousel" aria-label="메인 슬라이드">
      <div className="WCMSScontWrap">
        <ul className="WCMSSsld">
          {heroSlides.map((s, i) => (
            <li
              key={s.image}
              className={`WCMSSsldL${i === index ? " current" : ""}${i === index && on ? " on" : ""}`}
              aria-hidden={i !== index}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${heroSlides.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 원본처럼 900×400 이미지를 폭에 맞춰 늘림 (모바일은 가운데 잘라 확대) */}
              <img src={s.image} alt={s.alt} width={900} height={400} fetchPriority={i === 0 ? "high" : "low"} loading={i === 0 ? "eager" : "lazy"} />
              {s.caption && (
                <div className="WCMSScontS">
                  <div>
                    <strong>{site.name}</strong>
                    <u>{site.slogan}</u>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        {heroSlides.length > 1 && (
          <div className="bx-pager">
            {heroSlides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                className={i === index ? "active" : undefined}
                aria-label={`${i + 1}번 슬라이드 보기`}
                aria-current={i === index}
                onClick={() => {
                  setAuto(false);
                  if (i !== index) go(i);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
