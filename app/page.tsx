"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

const PAGE_SIZE = 20;

function sortWorksStable() {
  // 販売中を先頭へ（それ以外はWORKSの順序を維持）
  const sellable = WORKS.filter((w) => Boolean((w as any).stripePriceId));
  const others = WORKS.filter((w) => !Boolean((w as any).stripePriceId));
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
            {/* グリッド（9:16のまま。hover演出なし） */}
            <div className="featuredGrid" style={{ marginTop: 0 }}>
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
                    <div
                      className="featuredFrame"
                      style={{
                        width: "100%",
                        aspectRatio: "9 / 16",
                        overflow: "hidden",
                        background: "rgba(242,242,242,0.05)",
                      }}
                    >
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

            {/* More */}
            {hasMore && (
              <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
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
        </section>

        {/* 仕様説明（簡易）— フッター直前 */}
        <section className="section" style={{ paddingTop: 0, paddingBottom: 70 }}>
          <div className="container">
            <hr className="hr" />
            <div style={{ marginTop: 26 }}>
              <div className="kicker">Specs</div>
              <div style={{ marginTop: 10, color: "rgba(242,242,242,0.72)", lineHeight: 1.9, fontSize: 13 }}>
                すべて <strong style={{ color: "rgba(242,242,242,0.9)", fontWeight: 500 }}>9:16 / 1080×1920</strong>。
                <br />
                購入後すぐにダウンロード。静止画を起点に、あなたの編集で映像へ。
                <br />
                タイトルを固定しないのは、受け取った人の想像が完成する設計のため。
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link className="btn btnPrimary" href="/favorites">
                  ♡お気に入りを見る
                </Link>
                <Link className="btn" href="/license">
                  License
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* heroMinimal のページ内CSSは “削除” 指示なので、ここでは何も書かない */}
      </main>
    </SiteFrame>
  );
}
