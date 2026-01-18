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

function pickFeaturedStable() {
  return [...WORKS]
    .sort((a, b) => Number(Boolean(b.stripePriceId)) - Number(Boolean(a.stripePriceId)))
    .slice(0, 8);
}

function pickFeaturedRandomStrong() {
  const sellable = shuffle(WORKS.filter((w) => Boolean(w.stripePriceId)));
  const others = shuffle(WORKS.filter((w) => !w.stripePriceId));
  const picked = [...sellable.slice(0, 6), ...others].slice(0, 8);
  return shuffle(picked);
}

const SCROLL_KEY = "hopy:home:scrollY";
const RESTORE_FLAG = "hopy:home:restore";

function saveHomeScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
    sessionStorage.setItem(RESTORE_FLAG, "1");
  } catch {}
}

function restoreHomeScrollIfNeeded() {
  try {
    const flag = sessionStorage.getItem(RESTORE_FLAG);
    if (flag !== "1") return;

    const raw = sessionStorage.getItem(SCROLL_KEY);
    const y = raw ? Number(raw) : 0;

    // 一回だけ復元（次の通常遷移で邪魔しない）
    sessionStorage.removeItem(RESTORE_FLAG);

    // 描画後に復元（iOS/Safariの戻る対策で2段構え）
    requestAnimationFrame(() => window.scrollTo(0, y));
    setTimeout(() => window.scrollTo(0, y), 0);
  } catch {}
}

export default function HomePage() {
  const stable = useMemo(() => pickFeaturedStable(), []);
  const [featuredWorks, setFeaturedWorks] = useState(stable);

  useEffect(() => {
    setFeaturedWorks(pickFeaturedRandomStrong());
  }, []);

  // 戻ってきた時だけスクロール位置を復元
  useEffect(() => {
    restoreHomeScrollIfNeeded();

    // iPhoneのスワイプ戻るは pageshow で復元されることがあるのでケア
    const onPageShow = () => restoreHomeScrollIfNeeded();
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <SiteFrame>
      <main>
        {/* Hero：タイトルだけ → 直下から画像 */}
        <section className="heroMinimal">
          <div className="container">
            <div className="kicker">AI VISUAL STUDIO</div>
            <h1 className="h1">Silent Start</h1>
          </div>
        </section>

        {/* 画像グリッド（無言） */}
        <section className="section" style={{ paddingTop: 22 }}>
          <div className="container">
            <div className="featuredGrid">
              {featuredWorks.map((w: any) => (
                <div key={w.slug} style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
                    // ★遷移前に「トップのスクロール位置」を保存する
                    onClick={() => saveHomeScroll()}
                    className="featuredTile"
                    style={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderRadius: 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                      transform: canHover ? "translateZ(0)" : undefined,
                    }}
                  >
                    <div className="featuredFrame">
                      <img
                        src={w.image}
                        alt={w.title ?? w.slug}
                        className="featuredImg"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: canHover ? "transform 260ms ease" : undefined,
                        }}
                      />
                    </div>
                  </Link>

                  {/* 右上：お気に入り */}
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
