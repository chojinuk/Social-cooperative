import Link from "next/link";
import { InquiryItem } from "@/components/admin/InquiryItem";
import { adminListInquiries } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

// 관리자 화면: 매 요청 서버 렌더링 (DB 최신값 · 로그인 확인)
export const instant = false;

export const metadata = { title: "상담 및 제안" };

export default async function AdminInquiries({ searchParams }: PageProps<"/admin/inquiries">) {
  await requireAdmin();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { items, total, totalPages } = await adminListInquiries(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold text-ink">상담 및 제안</h1>
        <p className="mt-1 text-muted">
          총 {total}건 · 홈페이지 <Link href="/contact" target="_blank" className="text-theme underline">상담 및 제안</Link> 양식으로 접수된 글입니다. 개인정보가 담겨 있으니 답변 후 1년이 지나면 삭제해 주세요.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-line bg-white py-16 text-center text-muted">접수된 글이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <InquiryItem
              key={it.id}
              item={{ id: it.id, name: it.name, email: it.email, phone: it.phone, subject: it.subject, message: it.message, isRead: it.isRead, createdAt: it.createdAt.toISOString() }}
            />
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-1" aria-label="페이지">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/inquiries?page=${n}`}
              aria-current={n === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-[14px] ${n === page ? "bg-theme text-white" : "border border-line bg-white text-body"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
