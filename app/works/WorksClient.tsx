"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

type Mode = "all" | "sellable" | "random";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WorksClient() {
  const STEP = 36;

  const [mode, setMode] = useState<Mode>("all");
  const [visible, setVisible] = useState(STEP);

  const setModeSafe = (m: Mode) => {
    setMode(m);
    setVisible(STEP);
  };

  const filtered = useMemo(() => {
    if (mode === "sellable") return WORKS.filter((w) => Boolean((w as any).stripePriceId));
    if (mode === "random") return shuffle(WORKS);
    return WORKS;
  }, [mode]);

  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);

  const total = filtered.length;
  const remaining = Math.max(0, total - shown.length);

  return (
    <div style={{ marginTop: 18 }}>
      {/* 上部コントロール */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 14,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.6 }}>
          {mode === "sellable" ? "販売中のみ表示" : mode === "random" ? "ランダム表示" : "すべて表示"}
          <br />
          <span style={{ opacity: 0.7 }}>
            {shown.length} / {total} 枚
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn"
            type="button"
            onClick={() => setModeSafe("all")}
            style={{
              borderRadius: 0,
              opacity: mode === "all" ? 1 : 0.75,
              background: mode === "all" ? "rgba(242,242,242,0.06)" : "transparent",
            }}
          >
            すべて
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => setModeSafe("sellable")}
            style={{
              borderRadius: 0,
              opacity: mode === "sellable" ? 1 : 0.75,
              background: mode === "sellable" ? "rgba(242,242,242,0.06)" : "transparent",
            }}
          >
            販売中
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => setModeSafe("random")}
            style={{
              borderRadius: 0,
              opacity: mode === "random" ? 1 : 0.75,
              background: mode === "random" ? "rgba(242,242,242,0.06)" : "transparent",
            }}
          >
            ランダム
          </button>
        </div>
      </div>

      {/* グリッド（Featuredと同じ見た目） */}
      <div style={{ marginTop: 16 }}>
        <div className="featuredGrid">
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
                aria-label={`Open ${w.slug}`}
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
                    }}
                  />
                </div>

                <div className="featuredMeta">
                  <div className="featuredTitle">{w.title ?? w.slug}</div>
                  <div className="featuredSub">
                    {w.stripePriceId ? "販売中" : "準備中"} {" · "}¥
                    {Number(w.price ?? 0).toLocaleString("ja-JP")}
                  </div>
                </div>
              </Link>

              {/* 右上：お気に入り（リンクに飛ばさない） */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 3,
                }}
                onClick={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
              >
                <FavoriteButton slug={w.slug} compact size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* もっと見る */}
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        {remaining > 0 ? (
          <button
            className="btn btnPrimary"
            type="button"
            onClick={() => setVisible((v) => Math.min(v + STEP, total))}
            style={{ borderRadius: 0 }}
          >
            もっと見る（あと {remaining} 枚）
          </button>
        ) : (
          <div style={{ fontSize: 12, opacity: 0.65, padding: "10px 0" }}>ここまで</div>
        )}
      </div>

      {/* Featuredと同じCSS（Works側に内包） */}
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

        @media (hover: hover) and (pointer: fine) {
          .featuredTile:hover .featuredImg { transform: scale(1.02); }
          .featuredImg{ transition: transform 260ms ease; }
        }
      `}</style>
    </div>
  );
}


