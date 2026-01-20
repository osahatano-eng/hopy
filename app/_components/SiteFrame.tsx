"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { FAVORITES_EVENT, favoritesCount } from "@/app/_lib/favorites";

export default function SiteFrame({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const sync = () => setCount(favoritesCount());
    sync();

    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  // 🔧 スクロール制御
  useEffect(() => {
    // 初回は無視
    if (!lastPath.current) {
      lastPath.current = pathname;
      return;
    }

    const from = lastPath.current;
    const to = pathname;

    lastPath.current = pathname;

    const isDetail = to.startsWith("/p/");
    const isTop = to === "/";

    if (isDetail) {
      // 詳細ページは必ず先頭
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      });
    }

    // トップページは復元される（何もしない）
  }, [pathname]);

  return (
    <>
      <header className="nav">
        <div className="container navInner">
          <Link className="brand" href="/">HOPY AI</Link>

          <nav className="navLinks" style={{ alignItems: "center" }}>
            <Link className="navLink" href="/license">License</Link>
            <Link className="navLink" href="/contact">Contact</Link>

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

      {/* ✅ Specs / Info Strip */}
<section className="specStrip" aria-label="Product specs and license summary">
  <div className="container">
    <div className="specBox">
      {/* English */}
      <div className="specCol">
        <div className="specLine">PNG format</div>
        <div className="specLine">1080 × 1920</div>
        <div className="specLine">9:16 aspect ratio</div>

        <div className="specGap" />

        <div className="specLine">No watermark</div>
        <div className="specLine">Commercial use allowed</div>
        <div className="specLine">Redistribution prohibited</div>

        <div className="specNote">
          Please review the{" "}
          <Link href="/terms">Terms</Link> &{" "}
          <Link href="/license">License</Link> before purchasing.
        </div>
      </div>

      <div className="specSep" aria-hidden="true" />

      {/* Japanese */}
      <div className="specCol">
        <div className="specLine">形式：PNG</div>
        <div className="specLine">解像度：1080 × 1920</div>
        <div className="specLine">比率：9:16</div>

        <div className="specGap" />

        <div className="specLine">クレジット表記不要</div>
        <div className="specLine">商用利用可</div>
        <div className="specLine">再配布・転売は禁止</div>

        <div className="specNote">
          ご購入前に「<Link href="/terms">利用規約</Link>」「
          <Link href="/license">ライセンス</Link>」をご確認ください。
        </div>
      </div>
    </div>
  </div>

  <style>{`
    .specStrip{
      padding: 56px 0 36px;
    }

    .specBox{
      border-top: 1px solid var(--hairline);
      padding-top: 22px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
    }

    @media (min-width: 820px){
      .specBox{
        grid-template-columns: 1fr auto 1fr;
        gap: 22px;
      }
    }

    .specCol{
      color: rgba(242,242,242,0.62);
      font-size: 12px;
      line-height: 1.9;
      letter-spacing: 0.02em;
    }

    .specLine{
      white-space: nowrap;
    }

    .specGap{
      height: 10px;
    }

    .specSep{
      display: none;
    }

    @media (min-width: 820px){
      .specSep{
        display: block;
        width: 1px;
        background: rgba(242,242,242,0.10);
      }
    }

    .specNote{
      margin-top: 12px;
      color: rgba(242,242,242,0.52);
      font-size: 12px;
      line-height: 1.9;
    }

    .specNote a{
      color: rgba(242,242,242,0.82);
      border-bottom: 1px solid rgba(242,242,242,0.20);
      padding-bottom: 2px;
    }

    .specNote a:hover{
      border-bottom-color: rgba(242,242,242,0.38);
    }

    /* モバイルでは自然に折り返し */
    @media (max-width: 819px){
      .specLine{
        white-space: normal;
      }
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

