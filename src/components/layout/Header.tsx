import Link from "next/link";
import { mainMenu } from "@/config/menu";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { SearchBox } from "./SearchBox";

/** 상단: 유틸 막대(#tnbWr 35px, 주조색) + 로고·주 메뉴(#gnb 80px). 스크롤하면 유틸 막대만 접힘 (ScrollState) */
export function Header() {
  return (
    <header id="hd">
      <div id="skip_to_container">
        <a href="#main">본문 바로가기</a>
      </div>
      <div id="tnbWr">
        <div id="tnb">
          <ul>
            {site.features.memberAuth ? null : (
              <>
                <li>
                  <Link href="/contact">
                    <b>
                      <Icon name="send" /> 상담 및 제안
                    </b>
                  </Link>
                </li>
                <li>
                  <Link href="/about/location">
                    <b>
                      <Icon name="home" /> 오시는길
                    </b>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <nav id="gnb" aria-label="주 메뉴">
        <div className="gnb_wrap">
          <div id="logo">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element -- 로고 SVG (교체 시 같은 경로에 덮어쓰기) */}
              <img src="/logo.svg" alt={site.name} width={274} height={60} />
            </Link>
          </div>
          <ul id="gnb_1dul">
            {mainMenu.map((m, i) => (
              <li key={m.label} className="gnb_1dli" style={{ zIndex: 999 - i }}>
                {m.externalOnly ? (
                  <a href={m.href} target="_blank" rel="noopener noreferrer" className="gnb_1da">
                    {m.label}
                    <u />
                  </a>
                ) : (
                  <Link href={m.href} className="gnb_1da">
                    {m.label}
                    <u />
                  </Link>
                )}
                <ul className="gnb_2dul">
                  {m.children.map((c) => (
                    <li key={c.href} className="gnb_2dli">
                      {c.external ? (
                        <a href={c.href} target="_blank" rel="noopener noreferrer" className="gnb_2da">
                          {c.label}
                        </a>
                      ) : (
                        <Link href={c.href} className="gnb_2da">
                          {c.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <SearchBox />
          </ul>
        </div>
      </nav>
    </header>
  );
}
