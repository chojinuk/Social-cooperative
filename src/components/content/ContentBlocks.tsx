import Link from "next/link";
import { Fragment } from "react";
import type { Block } from "@/content/pages";
import { history } from "@/content/history";
import { Icon } from "@/components/ui/Icon";

/** "\n" 줄바꿈을 <br/> 로 */
function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return lines.map((l, i) => (
    <Fragment key={i}>
      {l}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

/** 정적 페이지 블록 렌더러 (원본 WCMSS 섹션과 같은 마크업·클래스) */
export function ContentBlocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((b, i) => {
    switch (b.type) {
      case "text":
        return (
          <section key={i} className="WCMSSwr WCMSScontBasicOutside">
            <div className={`WCMSScontWrap contCol1 contAlign_${b.align === "center" ? "Center" : "Left"} contTxt${b.size ?? 1}`}>
              <div className="WCMSScont">
                {b.title && (
                  <h2 className="WCMSScontT">
                    <b>{b.title}</b>
                  </h2>
                )}
                {(b.body || b.image) && (
                  <div className="WCMSScontC">
                    {b.image && (
                      <span className={`WCMSScontImg imgAlign_${b.image.align}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image.src} alt={b.image.alt} width={b.image.width} height={b.image.height} loading="lazy" />
                      </span>
                    )}
                    {b.body && <Lines text={b.body} />}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      case "title":
        return (
          <div key={i} className="WCMSSwr">
            <h2 className="h2_title">{b.text}</h2>
          </div>
        );
      case "info":
        return (
          <div key={i} className="WCMSSwr">
            <p className="cont_text_info">
              <Lines text={b.body} />
            </p>
          </div>
        );
      case "table":
        return (
          <div key={i} className="WCMSSwr">
            <div className="basic_table">
              <table>
                {b.head && (
                  <thead>
                    <tr>
                      {b.head.map((h) => (
                        <th key={h} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {b.rows.map((r, ri) => (
                    <tr key={ri}>
                      {r.map((c, ci) => (ci === 0 ? <th key={ci} scope="row">{c}</th> : <td key={ci}>{c}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "cards":
        return (
          <section key={i} className="WCMSSwr WCMSScontBasicOutside">
            <div className={`WCMSScontWrap contCol${b.cols} contAlign_Center contTxt1`}>
              {b.items.map((c) => (
                <div key={c.title} className="WCMSScont">
                  <h3 className="WCMSScontT">
                    <b>{c.title}</b>
                  </h3>
                  <div className="WCMSScontC">
                    {c.image &&
                      (c.href ? (
                        <Link href={c.href} className="WCMSScontImg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.image} alt={c.title} width={400} height={267} loading="lazy" />
                        </Link>
                      ) : (
                        <span className="WCMSScontImg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.image} alt={c.title} width={400} height={267} loading="lazy" />
                        </span>
                      ))}
                    {c.body}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case "blank":
        return (
          <div key={i} className="WCMSSwr WCMSScontBlankOutside">
            <p
              className={`contBlankP${b.dashed ? " contBlankPDashed" : ""}`}
              style={b.dashed ? { marginTop: 15, marginBottom: 15 } : { height: b.height ?? 30 }}
            />
          </div>
        );
      case "button":
        return (
          <div key={i} className="WCMSSwr WCMSScontButtonOutside">
            <div className="WCMSScontWrap contButtonimgAlign_center">
              {b.external ? (
                <a href={b.href} target="_blank" rel="noopener noreferrer">
                  {b.label}
                  <Icon name="externalLink" />
                </a>
              ) : (
                <Link href={b.href}>
                  {b.label}
                  <Icon name="angleRight" />
                </Link>
              )}
            </div>
          </div>
        );
      case "map":
        return (
          <section key={i} className="WCMSScontMapOutside">
            <div className="WCMSSwr">
              <h2 className="h2_title">{b.title}</h2>
            </div>
            <div className="WCMSScontWrap">
              <iframe src={b.embedUrl} title={`${b.title} 지도`} height={450} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="WCMSSwr">
              <p className="cont_text" style={{ paddingTop: 15 }}>
                <strong>주소</strong> : {b.address}
                {b.tel && (
                  <>
                    <br />
                    {b.tel}
                  </>
                )}
              </p>
            </div>
            <div className="WCMSSwr WCMSScontButtonOutside">
              <div className="WCMSScontWrap contButtonimgAlign_center">
                <a href={b.naverUrl} target="_blank" rel="noopener noreferrer">
                  네이버 길찾기 바로가기
                  <Icon name="externalLink" />
                </a>
              </div>
            </div>
          </section>
        );
      case "history":
        return (
          <div key={i} className="WCMSSwr">
            <div className="history_table">
              {history.map((y) => (
                <section key={y.year} className="hYear">
                  <h2>{y.year}</h2>
                  <ul>
                    {y.items.map((it, k) => (
                      <li key={k}>
                        <em>{it.month}</em>
                        {it.text}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        );
    }
  });
}
