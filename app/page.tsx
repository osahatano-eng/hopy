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

// ★SSR/初回表示用（固定）：販売中優先で上から8（ランダムなし）
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
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="kicker">AI Visual Studio</div>
            <h1 className="h1">この1枚から、映像が始まる。</h1>

            <p className="sub">
              これは、完成された1枚ではありません。
              <br />
              物語が動き出す直前の、
              <br />
              <strong>“最初のフレーム”</strong>です。
              <br />
              <br />
              ここから先は、あなたの編集です。
            </p>

            <div className="btnRow">
              <Link className="btn btnPrimary" href="/works">
                作品を見る
              </Link>
              <Link className="btn btnGhost" href="/contact">
                依頼する
              </Link>
            </div>

            <div className="scrollHint" aria-hidden="true">
              <span>Scroll</span>
              <span className="scrollLine" />
            </div>

            <div className="proof">
              <div className="proofItem">
                <strong style={{ color: "rgba(242,242,242,0.9)", fontWeight: 500 }}>
                  映像の起点
                </strong>
                <br />
                1枚目から“始まる前提”で設計。
              </div>

              <div className="proofItem">
                <strong style={{ color: "rgba(242,242,242,0.9)", fontWeight: 500 }}>
                  9:16最適化
                </strong>
                <br />
                Short / Reels / 壁紙向け。
              </div>

              <div className="proofItem">
                <strong style={{ color: "rgba(242,242,242,0.9)", fontWeight: 500 }}>
                  即、動かせる
                </strong>
                <br />
                決済後すぐに納品。やり取りなしで完結します。
              </div>
            </div>
          </div>
        </section>

        <hr className="hr" />

        {/* SAMPLE */}
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Sample</div>
            <h2 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 500 }}>
              1枚から、動く
            </h2>

            <div style={{ marginTop: 14 }} className="sampleRow">
              {/* 左：Still */}
              <div className="sampleCol">
                <div className="sampleCap">Still（購入ページで見る1枚）</div>

                <div className="sampleFrame">
                  <img
                    src="/samples/quiet-fire.png"
                    alt="quiet-fire sample still"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </div>

              {/* 中央：矢印＋SAMPLE（画像と画像の間のセンターに） */}
              <div className="sampleMid" aria-hidden="true">
                <div className="sampleArrow">→</div>
                <div className="sampleLabel">SAMPLE</div>
              </div>

              {/* 右：Motion */}
              <div className="sampleCol">
                <div className="sampleCap">Motion（1枚を起点に動かした例）</div>

                <div className="sampleFrame">
                  <video
                    src="/videos/quiet-fire.mp4"
                    muted
                    playsInline
                    autoPlay
                    loop
                    preload="metadata"
                    controls={false}
                    onClick={(e) => {
                      const v = e.currentTarget;
                      if (v.paused) v.play();
                      else v.pause();
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      cursor: "pointer",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    opacity: 0.75,
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  タップで停止／再生（音なし）
                </div>
              </div>
            </div>

            <p className="smallP" style={{ marginTop: 14, opacity: 0.78 }}>
              Stillは、あなたのイメージを膨らます<strong>“最初のフレーム”</strong>。
              <br />
              Motionは、イメージを形にした<strong>ひとつの例</strong>です。
              <br />
              <br />
              Stillに、あなたのMotionを。
              <br />
              完成された1枚ではなく、<strong>始まりの1枚</strong>です。
            </p>
          </div>

          <style>{`
            .sampleRow{
              display: grid;
              grid-template-columns: 1fr auto 1fr;
              gap: 10px;
              align-items: start;
            }

            .sampleCol{
              min-width: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            .sampleFrame{
              width: 100%;
              max-width: 420px;
              margin: 0 auto;
              aspect-ratio: 9 / 16;
              overflow: hidden;
              background: rgba(242,242,242,0.05);
              border: 1px solid rgba(242,242,242,0.10);
            }

            /* キャプション高さ固定（左右揃える） */
            .sampleCap{
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              opacity: 0.72;
              text-align: center;
              margin-top: 8px;
            }

            /* 中央（画像と画像の間のセンターに） */
            .sampleMid{
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              transform: translateY(26px); /* キャプション分だけ下げる */
              gap: 10px;
              opacity: 0.85;
              user-select: none;
              padding: 0 6px;
            }

            .sampleArrow{
              font-size: 28px;
              line-height: 1;
              opacity: 0.95;
            }

            .sampleLabel{
              font-size: 11px;
              letter-spacing: 0.22em;
              opacity: 0.7;
              border: 1px solid rgba(255,255,255,0.18);
              padding: 6px 10px;
              background: rgba(0,0,0,0.12);
              white-space: nowrap;
            }

            /* ★スマホ時だけ → を ↓ に */
            @media (max-width: 919px){
              .sampleRow{
                grid-template-columns: 1fr;
                gap: 12px;
              }

              .sampleMid{
                transform: none;
                height: auto;
                flex-direction: row;
                gap: 10px;
                padding: 6px 0;
              }

              .sampleArrow{
                visibility: hidden;
                position: relative;
                width: 1em;
                height: 1em;
              }
              .sampleArrow::before{
                content: "↓";
                visibility: visible;
                position: absolute;
                left: 0;
                right: 0;
                text-align: center;
              }
            }
          `}</style>
        </section>

        <hr className="hr" />

        {/* ✅ FEATURED（container内のまま、♡追加） */}
        <section className="section">
          <div className="container">
            <div className="kicker">Featured</div>
            <h2 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 500 }}>
              いま、選ばれているフレーム
            </h2>

            <div style={{ marginTop: 14 }} className="featuredGrid">
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

                    <div className="featuredMeta">
                      <div className="featuredTitle">{w.title ?? w.slug}</div>
                      <div className="featuredSub">
                        {w.stripePriceId ? "販売中" : "準備中"}
                        {" · "}¥{Number(w.price ?? 0).toLocaleString("ja-JP")}
                      </div>
                    </div>
                  </Link>

                  {/* ★ 右上：お気に入り（押してもリンクへ飛ばない） */}
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

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btnPrimary" href="/works">
                作品一覧で選ぶ
              </Link>
              <Link className="btn" href="/favorites">
                ♡お気に入りを見る
              </Link>
            </div>
          </div>

          <style>{`
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
