"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ★SSR/初回表示用（固定）
function pickFeaturedStable() {
  return [...WORKS]
    .sort((a, b) => Number(Boolean(b.stripePriceId)) - Number(Boolean(a.stripePriceId)))
    .slice(0, 8);
}

// ★クライアント側でだけランダム（販売中優先で強め）
function pickFeaturedRandomStrong() {
  const sellable = shuffle(WORKS.filter((w) => Boolean(w.stripePriceId)));
  const others = shuffle(WORKS.filter((w) => !w.stripePriceId));
  const picked = [...sellable.slice(0, 6), ...others].slice(0, 8);
  return shuffle(picked);
}

const SCROLL_KEY = "hopy:home:scrollY";
const RESTORE_FLAG = "hopy:home:restore";

function markRestore() {
  try {
    sessionStorage.setItem(RESTORE_FLAG, "1");
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
  } catch {}
}

function consumeRestoreFlag(): boolean {
  try {
    const ok = sessionStorage.getItem(RESTORE_FLAG) === "1";
    sessionStorage.removeItem(RESTORE_FLAG);
    return ok;
  } catch {
    return false;
  }
}

function readSavedScrollY(): number {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function getNavType(): string {
  // iOS/Chromeでも取れる可能性が高い
  try {
    const nav = performance.getEntriesByType("navigation")?.[0] as any;
    return nav?.type || "navigate";
  } catch {
    return "navigate";
  }
}

export default function HomePage() {
  const stable = useMemo(() => pickFeaturedStable(), []);
  const [featuredWorks, setFeaturedWorks] = useState<any[]>(stable);

  // 初回マウント時：戻る(bfcache/back_forward)なら「何もしない」
  useEffect(() => {
    // iOSの“戻る”で scroll を勝手に変えないように manual
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    const navType = getNavType();
    const isBackForward = navType === "back_forward";

    // ✅ 戻る時はランダム禁止（ここが最重要）
    if (!isBackForward) {
      setFeaturedWorks(pickFeaturedRandomStrong());
    }

    // iOSの右スワイプ戻る(bfcache)で効く：pageshowで復元
    const onPageShow = (e: PageTransitionEvent) => {
      // persisted = bfcache 復帰
      const shouldRestore = e.persisted || consumeRestoreFlag();
      if (!shouldRestore) return;

      const y = readSavedScrollY();

      // 画像/レイアウト確定待ちで複数回
      requestAnimationFrame(() => window.scrollTo(0, y));
      setTimeout(() => window.scrollTo(0, y), 0);
      setTimeout(() => window.scrollTo(0, y), 80);
      setTimeout(() => window.scrollTo(0, y), 200);
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <SiteFrame>
      <main>
        <section className="heroMinimal">
          <div className="container">
            <div className="kicker">AI VISUAL STUDIO</div>
            <h1 className="h1">Silent Start</h1>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 22 }}>
          <div className="container">
            <div className="featuredGrid">
              {featuredWorks.map((w: any) => (
                <div key={w.slug} style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
                    // ✅ 詳細へ行く直前に「戻り復元フラグ + scrollY」を保存
                    onClick={() => markRestore()}
                    className="featuredTile"
                    style={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderRadius: 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div className="featuredFrame">
                      <img
                        src={w.image}
                        alt={w.title ?? w.slug}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  </Link>

                  <div
                    style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    <FavoriteButton slug={w.slug} compact size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .heroMinimal{
              padding: 78px 0 18px;
            }
            .featuredGrid{
              display:grid;
              grid-template-columns: repeat(2, minmax(0,1fr));
              gap: 12px;
            }
            @media (min-width: 920px){
              .featuredGrid{
                grid-template-columns: repeat(4, minmax(0,1fr));
                gap: 14px;
              }
            }
            .featuredFrame{
              width: 100%;
              aspect-ratio: 9 / 16;
              overflow: hidden;
              background: rgba(242,242,242,0.05);
            }
          `}</style>
        </section>
      </main>
    </SiteFrame>
  );
}
