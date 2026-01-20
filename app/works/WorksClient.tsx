"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FavoriteButton from "@/app/_components/FavoriteButton";

type Mode = "all" | "sellable";

type WorkLite = {
  slug: string;
  image: string;
  series: string;
  stripePriceId: string;
  price: number;
};

type SeriesDef = { key: string; label: string };

const SERIES_ORDER: SeriesDef[] = [
  { key: "dino", label: "Dino 246 GT" },
  { key: "gt350h", label: "Shelby GT350H" },
  { key: "964", label: "Porsche 964" },
  { key: "f100", label: "Ford F-100" },
  { key: "bronco", label: "Ford Bronco" },
  { key: "moto", label: "Motorcycles" },
];

const OTHER_SERIES_KEY = "__other__";
const OTHER_SERIES_LABEL = "Other";

function bySellableFirstStable(list: WorkLite[]) {
  const sellable = list.filter((w) => Boolean(w.stripePriceId));
  const others = list.filter((w) => !Boolean(w.stripePriceId));
  return [...sellable, ...others];
}

export default function WorksClient({ works }: { works: WorkLite[] }) {
  const [mode, setMode] = useState<Mode>("all");

  const baseList = useMemo(() => {
    const list = mode === "sellable" ? works.filter((w) => Boolean(w.stripePriceId)) : works;
    return bySellableFirstStable(list);
  }, [mode, works]);

  const seriesBuckets = useMemo(() => {
    const map = new Map<string, WorkLite[]>();
    for (const w of baseList) {
      const k = w.series?.trim() || OTHER_SERIES_KEY;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(w);
    }
    return map;
  }, [baseList]);

  const orderedSeriesKeys = useMemo(() => {
    const keys: string[] = [];

    for (const s of SERIES_ORDER) {
      if ((seriesBuckets.get(s.key) ?? []).length > 0) keys.push(s.key);
    }
    for (const k of seriesBuckets.keys()) {
      if (k === OTHER_SERIES_KEY) continue;
      if (!SERIES_ORDER.some((x) => x.key === k)) keys.push(k);
    }
    if ((seriesBuckets.get(OTHER_SERIES_KEY) ?? []).length > 0) keys.push(OTHER_SERIES_KEY);

    return keys;
  }, [seriesBuckets]);

  const seriesLabel = (key: string) => {
    if (key === OTHER_SERIES_KEY) return OTHER_SERIES_LABEL;
    return SERIES_ORDER.find((s) => s.key === key)?.label ?? key;
  };

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
          {mode === "sellable" ? "販売中のみ表示" : "すべて表示"}
          <br />
          <span style={{ opacity: 0.7 }}>{baseList.length} 枚</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn"
            type="button"
            onClick={() => setMode("all")}
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
            onClick={() => setMode("sellable")}
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

      {/* Netflix棚 */}
      <div style={{ marginTop: 18 }}>
        {orderedSeriesKeys.map((sKey) => {
          const items = seriesBuckets.get(sKey) ?? [];
          if (items.length === 0) return null;

          return (
            <section key={sKey} className="shelf">
              <div className="shelfHead">
                <div className="shelfTitle">{seriesLabel(sKey)}</div>
              </div>

              <div className="rail" aria-label={`series-${sKey}`}>
                {items.map((w) => (
                  <div key={w.slug} className="cardWrap">
                    <Link href={`/p/${w.slug}`} className="card" aria-label={`Open ${w.slug}`}>
                      <div className="frame">
                        <img src={w.image} alt={w.slug} className="img" />
                      </div>
                    </Link>

                    <div
                      className="fav"
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
          );
        })}
      </div>

      <style>{`
        .shelf{ margin-top: 22px; }
        .shelfHead{
          display:flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }
        .shelfTitle{
          font-size: 12px;
          letter-spacing: 0.12em;
          opacity: 0.85;
          text-transform: uppercase;
        }
        .rail{
          display:flex;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 8px;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .cardWrap{
          position: relative;
          flex: 0 0 auto;
          width: 46vw;
          max-width: 280px;
          scroll-snap-align: start;
        }
        @media (min-width: 920px){
          .cardWrap{ width: 220px; max-width: 240px; }
          .rail{ gap: 14px; }
        }
        .card{
          display:block;
          border-radius: 0;
          border: 1px solid rgba(255,255,255,0.10);
          overflow: hidden;
          background: rgba(242,242,242,0.04);
        }
        .frame{
          width: 100%;
          aspect-ratio: 9 / 16;
          overflow:hidden;
          background: rgba(242,242,242,0.05);
        }
        .img{
          width:100%;
          height:100%;
          object-fit: cover;
          display:block;
        }
        .fav{
          position:absolute;
          top: 10px;
          right: 10px;
          z-index: 3;
        }
        @media (hover: hover) and (pointer: fine) {
          .card:hover .img { transform: scale(1.02); }
          .img{ transition: transform 260ms ease; }
        }
      `}</style>
    </div>
  );
}
