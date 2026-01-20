"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

type Mode = "all" | "sellable";

/**
 * seriesキーは短いの推奨:
 * "964" / "dino" / "gt350h" / "f100" / "bronco" / "moto"
 */
const SERIES_ORDER = ["dino", "gt350h", "964", "f100", "bronco", "moto"] as const;

const SERIES_LABEL: Record<(typeof SERIES_ORDER)[number], string> = {
  dino: "Dino 246 GT",
  gt350h: "Ford Shelby Mustang GT350H",
  "964": "Porsche 964",
  f100: "Ford F-100",
  bronco: "Ford Bronco",
  moto: "Motorcycles",
};

const STEP = 24;

type WorkLike = {
  slug: string;
  image: string;
  stripePriceId?: string | null;
  // あなたのデータ側で series を入れる想定（genreでも可）
  series?: string | null;
  genre?: string | null;
};

function getSeriesKey(w: WorkLike): string {
  return String((w.series ?? w.genre ?? "")).trim().toLowerCase();
}

function isSellable(w: WorkLike) {
  return Boolean(w.stripePriceId);
}

export default function WorksClient() {
  const [mode, setMode] = useState<Mode>("all");
  const [visible, setVisible] = useState(STEP);

  const baseList = useMemo<WorkLike[]>(() => WORKS as any, []);

  const filtered = useMemo(() => {
    const list = mode === "sellable" ? baseList.filter(isSellable) : baseList;
    return list;
  }, [baseList, mode]);

  const shownAll = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
  const hasMore = visible < filtered.length;

  const grouped = useMemo(() => {
    const map = new Map<string, WorkLike[]>();
    for (const w of filtered) {
      const key = getSeriesKey(w);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }

    // 並び順：SERIES_ORDER → それ以外（アルファベット）
    const orderedKeys: string[] = [];
    for (const k of SERIES_ORDER) orderedKeys.push(k);

    const rest = Array.from(map.keys())
      .filter((k) => !orderedKeys.includes(k))
      .sort((a, b) => a.localeCompare(b));

    const keys = [...orderedKeys, ...rest].filter((k) => map.has(k));

    return keys.map((k) => ({
      key: k,
      title: (SERIES_LABEL as any)[k] ?? (k ? k.toUpperCase() : "Others"),
      items: map.get(k)!,
    }));
  }, [filtered]);

  return (
    <div style={{ marginTop: 18 }}>
      {/* Controls */}
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
          {mode === "sellable" ? "販売中のみ表示" : "すべて表示"}
          <br />
          <span style={{ opacity: 0.7 }}>
            {Math.min(visible, filtered.length)} / {filtered.length} 枚
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setMode("all");
              setVisible(STEP);
            }}
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
            onClick={() => {
              setMode("sellable");
              setVisible(STEP);
            }}
            style={{
              borderRadius: 0,
              opacity: mode === "sellable" ? 1 : 0.75,
              background: mode === "sellable" ? "rgba(242,242,242,0.06)" : "transparent",
            }}
          >
            販売中
          </button>
        </div>
      </div>

      {/* Netflix風：シリーズ別 横スクロール */}
      <div style={{ marginTop: 22 }}>
        {grouped.map((row) => (
          <section key={row.key} style={{ marginTop: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <div style={{ letterSpacing: "0.08em", fontSize: 12, opacity: 0.85 }}>
                {row.title}
              </div>
              <div style={{ fontSize: 12, opacity: 0.55 }}>{row.items.length}</div>
            </div>

            <div className="rowScroller" aria-label={`${row.title} row`}>
              {row.items.map((w) => (
                <div key={w.slug} className="rowItem" style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
                    className="tile"
                    style={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderRadius: 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                    aria-label={`Open ${w.slug}`}
                  >
                    <div className="frame">
                      <img
                        src={w.image}
                        alt={w.slug}
                        className="img"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  </Link>

                  {/* 右上：お気に入り（リンクに飛ばさない） */}
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
          </section>
        ))}
      </div>

      {/* 全体グリッド（下に残す：探しやすさ担保） */}
      <section style={{ marginTop: 34 }}>
        <div style={{ letterSpacing: "0.08em", fontSize: 12, opacity: 0.75 }}>All</div>

        <div style={{ marginTop: 14 }}>
          <div className="grid">
            {shownAll.map((w) => (
              <div key={w.slug} style={{ position: "relative" }}>
                <Link
                  href={`/p/${w.slug}`}
                  className="tile"
                  style={{
                    position: "relative",
                    display: "block",
                    overflow: "hidden",
                    borderRadius: 0,
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  aria-label={`Open ${w.slug}`}
                >
                  <div className="frame">
                    <img
                      src={w.image}
                      alt={w.slug}
                      className="img"
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

        {/* More */}
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          {hasMore ? (
            <button
              className="btn btnPrimary"
              type="button"
              onClick={() => setVisible((v) => Math.min(v + STEP, filtered.length))}
              style={{ borderRadius: 0 }}
            >
              More
            </button>
          ) : (
            <div style={{ fontSize: 12, opacity: 0.65, padding: "10px 0" }}>End</div>
          )}
        </div>
      </section>

      <style>{`
        /* 横スクロール（Netflix系） */
        .rowScroller{
          display:flex;
          gap: 12px;
          overflow-x:auto;
          overflow-y:hidden;
          padding-bottom: 10px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .rowScroller::-webkit-scrollbar{ height: 8px; }
        .rowItem{
          flex: 0 0 auto;
          width: 168px; /* スマホで見やすい太さ */
          scroll-snap-align: start;
        }

        @media (min-width: 920px){
          .rowItem{ width: 210px; }
        }

        .frame{
          width: 100%;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background: rgba(242,242,242,0.05);
        }

        /* 全体グリッド（スマホ2列 / PC4列） */
        .grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 12px;
        }
        @media (min-width: 920px){
          .grid{
            grid-template-columns: repeat(4, minmax(0,1fr));
            gap: 14px;
          }
        }

        @media (hover: hover) and (pointer: fine) {
          .tile:hover .img { transform: scale(1.02); }
          .img{ transition: transform 260ms ease; }
        }
      `}</style>
    </div>
  );
}
