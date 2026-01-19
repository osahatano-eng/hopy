"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

const PAGE_SIZE = 20;

function sortWorksStable() {
  // 販売中を先頭へ（それ以外はWORKSの順序を維持）
  const sellable = WORKS.filter((w: any) => Boolean(w.stripePriceId));
  const others = WORKS.filter((w: any) => !Boolean(w.stripePriceId));
  return [...sellable, ...others];
}

export default function HomePage() {
  const allWorks = useMemo(() => sortWorksStable(), []);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const shown = allWorks.slice(0, visible);
  const hasMore = visible < allWorks.length;

  return (
    <SiteFrame>
      <main>
        {/* Hero（残す：AI VISUAL STUDIO / Silent Start） */}
        <section className="hero heroMinimal">
          <div className="container">
            <div className="kicker">AI VISUAL STUDIO</div>
            <h1 className="h1">Silent Start</h1>
          </div>
        </section>

        {/* Gallery */}
        <section className="section" id="gallery" style={{ paddingTop: 18 }}>
          <div className="container">
            <div className="featuredGridResponsive">
              {shown.map((w: any) => (
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

                  {/* 右上：お気に入り（リンクへ飛ばない） */}
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

            {/* 表示数カウンタ */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "center",
                fontSize: 12,
                color: "rgba(242,242,242,0.65)",
                letterSpacing: "0.08em",
              }}
            >
              {Math.min(visible, allWorks.length)}/{allWorks.length}
            </div>

            {/* More */}
            {hasMore && (
              <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
                <button
                  className="btn"
                  type="button"
                  onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, allWorks.length))}
                  aria-label="More"
                >
                  More
                </button>
              </div>
            )}
          </div>

          <style>{`
            /* スマホ：2列 */
            .featuredGridResponsive{
              display:grid;
              grid-template-columns: repeat(2, minmax(0,1fr));
              gap: 12px;
            }

            /* PC：4列 */
            @media (min-width: 920px){
              .featuredGridResponsive{
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
