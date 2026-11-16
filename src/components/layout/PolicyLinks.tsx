"use client";

import { useRef, useState } from "react";
import { site } from "@/config/site";
import type { Policy } from "@/content/policies";

/**
 * 푸터 약관 링크 — 원본처럼 클릭하면 모달(.term_area)로 열림.
 * 링크 자체는 /policy/[slug] 정적 페이지를 가리켜 검색엔진·JS 꺼진 환경에서도 읽을 수 있다.
 */
export function PolicyLinks({ policies }: { policies: Policy[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<Policy | null>(null);

  return (
    <>
      {policies.map((p) => (
        <a
          key={p.slug}
          href={`/policy/${p.slug}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrent(p);
            dialog.current?.showModal();
          }}
        >
          {p.title}
        </a>
      ))}
      <dialog
        ref={dialog}
        className="term_dialog"
        aria-labelledby="term_title"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        {current && (
          <div className="term_area">
            <header>
              <h2 id="term_title">{current.title}</h2>
              <button type="button" onClick={() => dialog.current?.close()} aria-label="닫기">
                ×
              </button>
            </header>
            <section>
              <p>{current.body}</p>
            </section>
            <footer>{site.name}</footer>
          </div>
        )}
      </dialog>
    </>
  );
}
