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

// ★クライアント側でだけランダム（販売中優先）
function pickFeaturedRandomStrong() {
  const sellable = shuffle(WORKS.filter((w) => Boolean(w.stripePriceId)));
  const others = shuffle(WORKS.filter((w) => !w.stripePriceId));
  const picked = [...sellable.slice(0, 6), ...others].slice(0, 8);
  return shuffle(picked);
}

export default function HomePage() {
  const stable = useMemo(() => pickFeaturedStable(), []);
  const [featuredWorks, setFeaturedWorks] = useState(stable);

  useEffect(() => {
    setFeaturedWorks(pickFeaturedRandomStrong());
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

        {/* ここから画像（Featured） */}
        <section className="section" style={{ paddingTop: 22 }}>
          <div className="container">
            <div className="featuredGrid">
              {featuredWorks.map((w: any) => (
                <div key={w.slug} style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
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

                    {/* メタは最小（不要なら丸ごと削除可能） */}
                    <div className="featuredMeta">
                      <div className="featuredTitle">{w.title ?? w.slug}</div>
                      <div className="featuredSub">
                        {w.stripePriceId ? "販売中" : "準備中"}
                        {" · "}¥{Number(w.price ?? 0).toLocaleString("ja-JP")}
                      </div>
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

            @media (hover: hover) and (pointer: fine){
              .featuredTile:hover .featuredImg{
                transform: scale(1.02);
              }
            }

            .featuredMeta{
              padding: 10px 10px 12px;
              background: rgba(0,0,0,0.18);
              border-top: 1px solid rgba(255,255,255,0.08);
            }

            .featuredTitle{
              font-size: 12px;
              opacity: 0.92;
              line-height: 1.4;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .featuredSub{
              margin-top: 6px;
              font-size: 11px;
              opacity: 0.7;
              letter-spacing: 0.02em;
            }
          `}</style>
        </section>
      </main>
    </SiteFrame>
  );
}
