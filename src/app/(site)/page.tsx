import type { Metadata } from "next";
import { HeroSlider } from "@/components/home/HeroSlider";
import { BusinessCards } from "@/components/home/BusinessCards";
import { LatestThree } from "@/components/home/LatestThree";
import { SideBar } from "@/components/layout/SideBar";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/config/site";
import { banners } from "@/content/home";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div id="ctWrap" className="mainOnlyWrap">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <h1 className="sound_only">{site.name}</h1>

      {/* 공백 60px (850px 이하 30px) */}
      <div className="WCMSSwr WCMSScontBlankOutside">
        <p className="contBlankP blank60" style={{ height: 60 }} />
      </div>

      <HeroSlider />
      <BusinessCards />
      <LatestThree />

      {/* 점선 구분 */}
      <div className="WCMSSwr WCMSScontBlankOutside">
        <p className="contBlankP contBlankPDashed" style={{ marginTop: 15, marginBottom: 15 }} />
      </div>

      <section className="WCMSSwr WCMSScontImgOutside" aria-label="관련기관 바로가기">
        <div className="WCMSScontWrap contCol4">
          {banners.map((b) => (
            <div key={b.href} className="WCMSScont">
              <div className="WCMSScontC">
                <a href={b.href} target="_blank" rel="noopener noreferrer" className="WCMSScontImg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image} alt={`${b.label} (새 창)`} width={550} height={174} loading="lazy" />
                  <span className="badge">
                    <Icon name="externalLink" />
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 모바일 메뉴 서랍 (PC 메인에서는 숨김) */}
      <SideBar />
    </div>
  );
}
