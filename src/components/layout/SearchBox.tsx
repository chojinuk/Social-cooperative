"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** 전체검색 — 돋보기를 누르면 검색창이 펼쳐짐 (원본 #allSchBox). 결과는 /search?q= */
export function SearchBox() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  return (
    <li className={`gnb_1dli allSchBoxWr${open ? " on" : ""}`}>
      <button type="button" id="btnSchbox" aria-expanded={open} aria-controls="allSchBox" onClick={() => setOpen((v) => !v)}>
        <Icon name="search" />
        <span className="sound_only">전체검색 {open ? "닫기" : "열기"}</span>
      </button>
      <div id="allSchBox">
        <form
          role="search"
          action="/search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = input.current?.value.trim() ?? "";
            if (q.length < 2) {
              setError("검색어는 두 글자 이상 입력해 주세요.");
              input.current?.focus();
              return;
            }
            setError(null);
            setOpen(false);
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <label htmlFor="sch_stx" className="sound_only">
            검색어
          </label>
          <input
            ref={input}
            type="search"
            name="q"
            id="sch_stx"
            required
            minLength={2}
            maxLength={20}
            title="검색어는 두 글자 이상 입력해 주세요."
            placeholder="Search..."
            aria-invalid={!!error}
            aria-describedby={error ? "sch_err" : undefined}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          />
          <button type="submit" id="sch_submit">
            <Icon name="search" />
            <span className="sound_only">검색</span>
          </button>
          <button type="button" id="allSchBoxClose" onClick={() => setOpen(false)}>
            <Icon name="close" />
            <span className="sound_only">전체검색 닫기</span>
          </button>
        </form>
        {error && (
          <p id="sch_err" role="alert" className="sound_only">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
