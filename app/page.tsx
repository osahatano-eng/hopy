"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";

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

// ★クライアント用（B）：販売中を強く優先しつつ毎回ランダム8
function pickFeaturedRandomStrong() {
  const sellable = shuffle(WORKS.filter((w) => Boolean(w.stripePriceId)));
  const others = shuffle(WORKS.filter((w) => !w.stripePriceId));

  const picked = [...sellable.slice(0, 6), ...others].slice(0, 8);
  return shuffle(picked);
}

export default function HomePage() {
  // SSRと一致させるため、最初は固定の並びで描画
  const stable = useMemo(() => pickFeaturedStable(), []);
  const [featuredWorks, setFeaturedWorks] = useState(stable);

  // マウント後にだけランダムへ差し替え（Hydration mismatch回避）
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

            {/* Proof */}
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

        {/* SAMPLE（画像 → 動画） */}
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Sample</div>
            <h2 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 500 }}>
              1枚から、動く
            </h2>

            <div style={{ marginTop: 14 }} className="sampleRow">
              {/* 左：画像 */}
              <div className="sampleCol">
                <div className="sampleFrame">
                  <img
                    src="/works/quiet-fire.png"
                    alt="quiet-fire sample still"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.72, textAlign: "center" }}>
                  Still（購入ページで見る1枚）
                </div>
              </div>

              {/* 中央：→ SAMPLE */}
              <div className="sampleMid" aria-hidden="true">
                <div className="sampleArrow">→</div>
                <div className="sampleLabel">SAMPLE</div>
              </div>

{/* 右：動画 */}
<div className="sampleCol">
  {/* ★注記：動画の上 */}
  <div
    style={{
      marginBottom: 8,
      fontSize: 12,
      opacity: 0.75,
      lineHeight: 1.6,
      textAlign: "center",
    }}
  >
    タップで停止／再生（音なし）
  </div>

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

  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.72, textAlign: "center" }}>
    Motion（1枚を起点に動かした例）
  </div>
</div>

            </div>

            <p className="smallP" style={{ marginTop: 14, opacity: 0.78 }}>
  左が、あなたが購入する<strong>“最初のフレーム”</strong>。
  <br />
  右は、そこから動かした<strong>ひとつの例</strong>です。
  <br />
  <br />
  このサイトで売っているのは、
  <br />
  完成された映像ではなく、<strong>始まりの1枚</strong>です。
</p>

          </div>

          <style>{`
            .sampleRow{
              display:grid;
              grid-template-columns: minmax(0,1fr);
              gap: 14px;
              align-items:center;
            }
            .sampleCol{ min-width:0; }
            .sampleFrame{
              width: 100%;
              max-width: 420px;
              margin: 0 auto;
              aspect-ratio: 9 / 16;
              overflow:hidden;
              border-radius:0;
              background: rgba(242,242,242,0.05);
              border: 1px solid rgba(242,242,242,0.10);
            }

            .sampleMid{
              display:flex;
              align-items:center;
              justify-content:center;
              gap: 10px;
              padding: 6px 0;
              opacity: 0.85;
              user-select:none;
            }
            .sampleArrow{
              font-size: 22px;
              line-height: 1;
              opacity: 0.95;
            }
            .sampleLabel{
              font-size: 11px;
              letter-spacing: 0.22em;
              opacity: 0.7;
              border: 1px solid rgba(255,255,255,0.18);
              padding: 6px 10px;
              border-radius: 0;
              background: rgba(0,0,0,0.12);
            }

            @media (min-width: 920px){
              .sampleRow{
                grid-template-columns: 1fr auto 1fr;
                gap: 18px;
              }
              .sampleMid{
                flex-direction:column;
                padding: 0 6px;
              }
              .sampleArrow{ font-size: 28px; }
            }
          `}</style>
        </section>

        <hr className="hr" />

        {/* Featured（代表作＝販売中強め＋ランダム） */}
        <section className="section">
          <div className="container">
            <div className="kicker">Featured</div>
            <h2 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 500 }}>
              作品
            </h2>
          </div>

          <div className="fullBleed">
            <div className="shortsGrid">
              {featuredWorks.map((w) => (
                <Link
                  key={w.slug}
                  href={`/p/${w.slug}`}
                  className="shortsTile"
                  style={{
                    position: "relative",
                    display: "block",
                    overflow: "hidden",
                    borderRadius: 0,
                    border: "1px solid rgba(255,255,255,0.10)",
                    transform: "translateY(0px)",
                    transition: canHover ? "transform .18s ease" : undefined,
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "4 / 5" }}>
                    <img
                      src={w.image}
                      alt={w.title}
                      className="shortsImg"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 0,
                        filter: "brightness(1.05)",
                        transition: canHover ? "filter .18s ease" : undefined,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="container">
            <div className="btnRow" style={{ marginTop: 22 }}>
              <Link className="btn btnPrimary" href="/works">
                すべての作品を見る
              </Link>
            </div>
          </div>

          <style>{`
            @media (hover: hover) and (pointer: fine) {
              .shortsTile:hover { transform: translateY(-2px); }
              .shortsTile:hover .shortsImg { filter: brightness(1.14); }
            }
          `}</style>
        </section>

        {/* How it works + Licensing */}
        <section className="section" style={{ paddingTop: 70 }}>
          <div className="container">
            <div className="twoCol">
              <div>
                <div className="kicker">How it works</div>
                <h3 style={{ margin: "10px 0 12px", fontSize: 18, fontWeight: 500 }}>
                  選ぶ → 決済 → すぐ使える
                </h3>
                <p className="smallP">
                  Stripe決済後、ダウンロードリンクが自動で発行されます。
                  <br />
                  縦型 9:16 のまま使える形式で提供します。
                </p>
              </div>

              <div>
                <div className="kicker">Licensing</div>
                <h3 style={{ margin: "10px 0 12px", fontSize: 18, fontWeight: 500 }}>
                  揉めないために、短く明確に
                </h3>
                <p className="smallP">
                  再配布・転売は禁止。商用利用はOK（用途の不安は購入前に相談）。
                  <br />
                  依頼制作（横長など）は別途対応します。
                </p>
                <div className="btnRow" style={{ marginTop: 14 }}>
                  <Link className="btn" href="/license">
                    ライセンス詳細
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
