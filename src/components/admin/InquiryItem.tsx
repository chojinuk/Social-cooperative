"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteInquiry, setInquiryRead } from "@/actions/admin";
import { formatDateTime } from "@/lib/format";

type Item = { id: number; name: string; email: string; phone: string; subject: string; message: string; isRead: boolean; createdAt: string };

/** 상담·제안 한 건 — 펼치면 읽음 처리 */
export function InquiryItem({ item }: { item: Item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const btn = "whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 text-[13px] transition disabled:opacity-50";

  return (
    <li className={`rounded-md border bg-white ${item.isRead ? "border-line" : "border-theme"}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!item.isRead) start(async () => { await setInquiryRead(item.id, true); router.refresh(); });
        }}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        {!item.isRead && <span className="shrink-0 rounded bg-theme px-1.5 py-0.5 text-[11px] font-bold text-white">새 글</span>}
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{item.subject}</span>
        <span className="hidden shrink-0 text-[13px] text-muted sm:inline">{item.name}</span>
        <span className="shrink-0 text-[13px] text-muted">{formatDateTime(item.createdAt)}</span>
      </button>
      {open && (
        <div className="border-t border-line px-5 py-4 text-[14px]">
          <dl className="mb-4 grid grid-cols-[70px_1fr] gap-y-1 text-body">
            <dt className="text-muted">이름</dt>
            <dd>{item.name}</dd>
            <dt className="text-muted">이메일</dt>
            <dd>{item.email ? <a href={`mailto:${item.email}`} className="text-theme underline">{item.email}</a> : "-"}</dd>
            <dt className="text-muted">연락처</dt>
            <dd>{item.phone ? <a href={`tel:${item.phone}`} className="text-theme underline">{item.phone}</a> : "-"}</dd>
          </dl>
          <p className="whitespace-pre-wrap rounded-md bg-surface p-4 leading-relaxed text-ink">{item.message}</p>
          <div className="mt-4 flex justify-end gap-1.5">
            <button
              type="button"
              disabled={pending}
              className={`${btn} hover:border-ink`}
              onClick={() => start(async () => { await setInquiryRead(item.id, false); router.refresh(); })}
            >
              안 읽음으로
            </button>
            <button
              type="button"
              disabled={pending}
              className={`${btn} text-hot hover:border-hot`}
              onClick={() => {
                if (!confirm("이 글을 삭제할까요? 삭제하면 되돌릴 수 없습니다.")) return;
                start(async () => { await deleteInquiry(item.id); router.refresh(); });
              }}
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
