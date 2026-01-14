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
              <div className="sampleCol">
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.72, textAlign: "center" }}>
                  Still（購入ページで見る1枚）
                </div>
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

              <div className="sampleMid" aria-hidden="true">
                <div className="sampleArrow">→</div>
                <div className="sampleLabel">SAMPLE</div>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.72, textAlign: "center" }}>
                  Motion（1枚を起点に動かした例）
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
<div className="sampleCol">
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
              align-items: center;
            }

            .sampleCol{ min-width: 0; }

            .sampleFrame{
              width: 100%;
              max-width: 420px;
              margin: 0 auto;
              aspect-ratio: 9 / 16;
              overflow: hidden;
              background: rgba(242,242,242,0.05);
              border: 1px solid rgba(242,242,242,0.10);
            }

            .sampleMid{
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              padding: 6px 0;
              opacity: 0.85;
              user-select: none;
            }

            .sampleArrow{
              font-size: 18px;
              line-height: 1;
              opacity: 0.95;
            }

            .sampleLabel{
              font-size: 10px;
              letter-spacing: 0.22em;
              opacity: 0.7;
              border: 1px solid rgba(255,255,255,0.18);
              padding: 5px 8px;
              background: rgba(0,0,0,0.12);
              white-space: nowrap;
            }

            /* ★スマホ時だけ → を ↓ に */
            @media (max-width: 919px){
              .sampleArrow{
                visibility: hidden;
                position: relative;
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

            @media (min-width: 920px){
              .sampleRow{ gap: 18px; }
              .sampleMid{ flex-direction: column; padding: 0 6px; }
              .sampleArrow{ font-size: 28px; }
              .sampleLabel{ font-size: 11px; padding: 6px 10px; }
            }
          `}</style>
        </section>

        <hr className="hr" />

        {/* 以下 Featured / How it works / Licensing は変更なし */}
        {/* （省略せずそのまま使ってください。必要なら続きも全部貼ります） */}

      </main>
    </SiteFrame>
  );
}
