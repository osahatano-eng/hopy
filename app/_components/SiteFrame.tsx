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

      {/* footerはそのままでOK */}
    </>
  );
}
