import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SubPage } from "@/components/layout/SubPage";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "상담 및 제안",
  description: `${site.name}에 궁금한 점이나 제안을 남겨 주세요. 전화 ${site.contact.phone}, 이메일 ${site.contact.email} 로도 문의할 수 있습니다.`,
  path: "/contact",
});

const PRIVACY = `[개인정보 수집 및 이용 안내]
1. 수집 항목: 이름(필수), 이메일·연락처(둘 중 하나 필수), 제목, 내용
2. 수집 목적: 상담 및 제안 내용 확인과 답변
3. 보유 기간: 접수일로부터 1년 (기간이 지나면 지체 없이 파기)
4. 동의를 거부할 수 있으나, 거부하면 상담 및 제안을 접수할 수 없습니다.`;

export default function Page() {
  return (
    <SubPage path="/contact" title="상담 및 제안">
      <div className="WCMSSwr">
        <p className="cont_text_info">
          <Icon name="phone" /> 전화 {site.contact.phone} · FAX {site.contact.fax} · E-mail {site.contact.email}
          <br />
          아래 양식으로 남겨 주신 글은 관리자만 볼 수 있습니다.
        </p>
      </div>
      <ContactForm privacy={PRIVACY} />
    </SubPage>
  );
}
