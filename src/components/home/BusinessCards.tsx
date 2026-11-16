import Link from "next/link";
import { businessCards } from "@/content/home";
import { Icon } from "@/components/ui/Icon";

/** 사업 카드 4열 (원본 WCMSScontBasicOutside · contCol4 contAlign_Center contTxt1, 700px 이하 2열) */
export function BusinessCards() {
  return (
    <section className="WCMSSwr WCMSScontBasicOutside" aria-labelledby="biz_title">
      <h2 id="biz_title" className="sound_only">
        주요 사업
      </h2>
      <div className="WCMSScontWrap contCol4 contAlign_Center contTxt1">
        {businessCards.map((c) => (
          <div key={c.href} className="WCMSScont">
            <h3 className="WCMSScontT">
              <b>{c.title}</b>
            </h3>
            <div className="WCMSScontC">
              <Link href={c.href} className="WCMSScontImg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.title} width={400} height={202} loading="lazy" />
                <span className="badge">
                  <Icon name="externalLink" />
                </span>
              </Link>
              {c.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
