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
          <Link className="brand" href="/">HOPY AI</Link>

          <nav className="navLinks" style={{ alignItems: "center" }}>
            <Link className="navLink" href="/works">Works</Link>
            <Link className="navLink" href="/license">License</Link>
            <Link className="navLink" href="/contact">Contact</Link>

            {/* お気に入り：♡ + 数字バッジだけ（全デバイス共通） */}
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

              {/* バッジ：1以上のときだけ表示 */}
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

            <Link className="btn btnPrimary" href="/works">作品を見る</Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="footer">
        <div className="container">
          <div className="footerTop">
            <div>
              <div className="kicker">Remember</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}>
                必要なときだけ、思い出してください。
              </div>
              <div className="btnRow" style={{ marginTop: 18 }}>
                <Link className="btn btnPrimary" href="/works">作品を見る</Link>
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
          {/* 追加：HOPY AI（containerいっぱい・真っ白・でかい） */}
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
              /* 画面サイズで自動調整：スマホでもPCでもでかい */
              font-size: clamp(64px, 7vw, 92px);

              /* container内で幅いっぱいに見せる */
              display: block;

              /* 左寄せにしたいなら left、中央なら center */
              text-align: center;
            }
          `}</style>
        </div>
      </footer>
    </>
  );
}








