"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { FAVORITES_EVENT, favoritesCount } from "@/app/_lib/favorites";

export default function SiteFrame({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setMounted(true);

    const sync = () => setCount(favoritesCount());
    sync();

    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  return (
    <>
      <header className="nav">
        <div className="container navInner">
          <Link className="brand" href="/">
            HOPY AI
          </Link>

          <nav className="navLinks" style={{ alignItems: "center" }}>
            <Link className="navLink" href="/license">
              License
            </Link>
            <Link className="navLink" href="/contact">
              Contact
            </Link>

            {/* お気に入り：♡ + 数字バッジ */}
            <Link
              className="btn"
              href="/favorites"
              style={{
                borderRadius: 0,
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              aria-label="お気に入り"
            >
              ♡
              {mounted && count > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-grid",
                    placeItems: "center",
                    minWidth: 18,
                    height: 18,
                    padding: "0 6px",
                    borderRadius: 999,
                    fontSize: 11,
                    lineHeight: 1,
                    background: "rgba(242,242,242,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "rgba(242,242,242,0.92)",
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {children}


{/* ✅ Info Strip（全ページ共通・フッター直前） */}
<section className="legalStrip" aria-label="Specs and license summary">
  <div className="container">
    <div className="legalBox">
      <div className="legalEn">
        <div className="legalLine">Format: PNG / 1080 × 1920 / 9:16</div>
        <div className="legalLine">No watermark. Commercial use allowed.</div>
        <div className="legalLine">Redistribution and resale are prohibited.</div>
        <div className="legalNote">
          Please review the{" "}
          <Link href="/terms">Terms</Link> &amp;{" "}
          <Link href="/tokushoho">Legal Notice</Link> before purchasing.
        </div>
      </div>

      <div className="legalSep" aria-hidden="true" />

      <div className="legalJa">
        <div className="legalLine">形式：PNG / 解像度：1080 × 1920（9:16）</div>
        <div className="legalLine">クレジット表記不要・商用利用可</div>
        <div className="legalLine">再配布・転売は禁止</div>
        <div className="legalNote">
          ご購入前に「<Link href="/terms">利用規約</Link>」「
          <Link href="/tokushoho">特商法表記</Link>」をご確認ください。
        </div>
      </div>
    </div>
  </div>

  <style>{`
    .legalStrip{
      padding: 54px 0 36px;
    }
    .legalBox{
      border-top: 1px solid var(--hairline);
      padding-top: 22px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    @media (min-width: 820px){
      .legalBox{
        grid-template-columns: 1fr auto 1fr;
        align-items: start;
        gap: 18px;
      }
    }

    .legalSep{
      display: none;
    }
    @media (min-width: 820px){
      .legalSep{
        display: block;
        width: 1px;
        height: 100%;
        background: rgba(242,242,242,0.10);
        margin-top: 2px;
      }
    }

    .legalEn, .legalJa{
      color: rgba(242,242,242,0.62);
      font-size: 12px;
      line-height: 1.8;
      letter-spacing: 0.02em;
    }

    .legalLine{
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* モバイルは折り返し許可（はみ出し防止） */
    @media (max-width: 819px){
      .legalLine{
        white-space: normal;
      }
    }

    .legalNote{
      margin-top: 10px;
      color: rgba(242,242,242,0.52);
      font-size: 12px;
      line-height: 1.9;
    }

    .legalNote a{
      color: rgba(242,242,242,0.82);
      border-bottom: 1px solid rgba(242,242,242,0.20);
      padding-bottom: 2px;
    }
    .legalNote a:hover{
      border-bottom-color: rgba(242,242,242,0.38);
    }
  `}</style>
</section>


      <footer className="footer">
        <div className="container">
          <div className="footerTop">
            <div>
              {/* Remember（そのまま） */}
              <div className="kicker">Remember</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}>
                必要なときだけ、思い出してください。
              </div>
            </div>

            <div className="footerLinks">
              <Link href="/terms">利用規約</Link>
              <Link href="/tokushoho">特商法</Link>
              <Link href="/privacy">プライバシー</Link>
              <a href="mailto:hatano@hopy.co.jp">問い合わせ</a>
            </div>
          </div>

          <hr className="hr footerLine" />

          <div style={{ color: "rgba(242,242,242,0.5)", fontSize: 12 }}>
            © {new Date().getFullYear()} HOPY CORPORATION
          </div>

          <div className="footerBigBrand" aria-label="HOPY AI">
            HOPY AI
          </div>

          <style>{`
            .footerBigBrand{
              margin-top: 50px;
              width: 100%;
              color: #fff;
              font-weight: 700;
              letter-spacing: 0.06em;
              line-height: 1;
              font-size: clamp(78px, 18vw, 300px);
              display: block;
              text-align: center;
            }
          `}</style>
        </div>
      </footer>
    </>
  );
}
