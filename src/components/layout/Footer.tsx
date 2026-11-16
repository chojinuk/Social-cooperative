import { site } from "@/config/site";
import { policies } from "@/content/policies";
import { PolicyLinks } from "./PolicyLinks";

/** 하단: 주조색 + 흰색 90% 덮개(실효 #E7F4F6), 왼쪽 약관·주소·저작권 / 오른쪽 위 로고 */
export function Footer() {
  const host = new URL(site.url).host;
  return (
    <footer id="footer">
      <div className="bottomSection">
        <dl>
          <dt>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt={site.name} width={183} height={40} loading="lazy" />
          </dt>
          <dd>
            <PolicyLinks policies={policies} />
          </dd>
        </dl>
        <address>
          <span>{site.address.full}</span>
          <span>TEL: {site.contact.phone}</span>
          <span>FAX: {site.contact.fax}</span>
          <span>E-mail: {site.contact.email}</span>
        </address>
        <p>
          <span className="pc_only">Copyright</span> &copy; <b>{host}</b> <span className="pc_only">All rights reserved.</span>
        </p>
      </div>
    </footer>
  );
}
