"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FavoriteButton from "@/app/_components/FavoriteButton";

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
  { key: "gt350h", label: "Ford Shelby Mustang GT350H" },
  { key: "964", label: "Porsche 964" },
  { key: "f100", label: "Ford F-100" },
  { key: "bronco", label: "Ford Bronco" },
  { key: "moto", label: "Motorcycles" },
];

const OTHER_SERIES_KEY = "__other__";
const OTHER_SERIES_LABEL = "Other";

// 1棚あたりの初期表示枚数（横スクロールなので“多すぎない”が正義）
const SHELF_LIMIT = 12;

function bySellableFirstStable(list: WorkLite[]) {
  const sellable = list.filter((w) => Boolean(w.stripePriceId));
  const others = list.filter((w) => !Boolean(w.stripePriceId));
  return [...sellable, ...others];
}

export default function HomeShelvesClient({ works }: { works: WorkLite[] }) {
  // モードはトップでは “売れる導線” を優先して sellable を上に寄せるだけ（フィルタ自体はしない）
  const baseList = useMemo(() => bySellableFirstStable(works), [works]);

  const seriesBuckets = useMemo(() => {
    const map = new Map<string, WorkLite[]>();
    for (const w of baseList) {
      const k = (w.series ?? "").trim() || OTHER_SERIES_KEY;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(w);
    }
    return map;
  }, [baseList]);

  const orderedSeriesKeys = useMemo(() => {
    const keys: string[] = [];

    // まず指定順（ブランド棚）
    for (const s of SERIES_ORDER) {
      const items = seriesBuckets.get(s.key) ?? [];
      if (items.length > 0) keys.push(s.key);
    }

    // そのほか未知シリーズがあれば後ろに（運用中に増えても壊れない）
    for (const k of seriesBuckets.keys()) {
      if (k === OTHER_SERIES_KEY) continue;
      if (!SERIES_ORDER.some((x) => x.key === k)) keys.push(k);
    }

    // Other は最後
    const other = seriesBuckets.get(OTHER_SERIES_KEY) ?? [];
    if (other.length > 0) keys.push(OTHER_SERIES_KEY);

    return keys;
  }, [seriesBuckets]);

  const seriesLabel = (key: string) => {
    if (key === OTHER_SERIES_KEY) return OTHER_SERIES_LABEL;
    return SERIES_ORDER.find((s) => s.key === key)?.label ?? key;
  };

  // 棚の「もっと見る」用（棚ごとに段階表示）
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div>
      {/* まず最上段：売れ筋（販売中のみ） */}
      <section className="shelf">
        <div className="shelfHead">
          <div className="shelfTitle">Available Now</div>
          <div className="shelfSub">Sellable first</div>
        </div>

        <div className="rail" aria-label="available-now">
          {baseList
            .filter((w) => Boolean(w.stripePriceId))
            .slice(0, 18)
            .map((w) => (
              <Card key={w.slug} w={w} />
            ))}
        </div>
      </section>

      {/* シリーズ棚 */}
      {orderedSeriesKeys.map((sKey) => {
        const itemsRaw = seriesBuckets.get(sKey) ?? [];
        if (itemsRaw.length === 0) return null;

        const isExpanded = Boolean(expanded[sKey]);
        const items = isExpanded ? itemsRaw : itemsRaw.slice(0, SHELF_LIMIT);
        const hasMore = itemsRaw.length > items.length;

        return (
          <section key={sKey} className="shelf">
            <div className="shelfHead">
              <div className="shelfTitle">{seriesLabel(sKey)}</div>

              {hasMore ? (
                <button
                  type="button"
                  className="shelfMore"
                  onClick={() => setExpanded((m) => ({ ...m, [sKey]: true }))}
                >
                  More
                </button>
              ) : (
                <div className="shelfCount">{itemsRaw.length}</div>
              )}
            </div>

            <div className="rail" aria-label={`series-${sKey}`}>
              {items.map((w) => (
                <Card key={w.slug} w={w} />
              ))}
            </div>
          </section>
        );
      })}

      {/* 軽い全体数だけ（説明文は入れない方針） */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "center",
          fontSize: 12,
          color: "rgba(242,242,242,0.65)",
          letterSpacing: "0.08em",
        }}
      >
        {works.length} frames
      </div>

      <style>{`
        .shelf{ margin-top: 22px; }
        .shelf:first-child{ margin-top: 0; }

        .shelfHead{
          display:flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .shelfTitle{
          font-size: 12px;
          letter-spacing: 0.18em;
          opacity: 0.85;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .shelfSub{
          font-size: 11px;
          opacity: 0.55;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .shelfCount{
          font-size: 11px;
          opacity: 0.55;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .shelfMore{
          font: inherit;
          background: transparent;
          border: 1px solid rgba(242,242,242,0.14);
          color: rgba(242,242,242,0.72);
          padding: 8px 10px;
          border-radius: 0;
          cursor: pointer;
          letter-spacing: 0.12em;
          font-size: 11px;
        }
        .shelfMore:hover{
          border-color: rgba(242,242,242,0.26);
          color: rgba(242,242,242,0.9);
        }

        .rail{
          display:flex;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 10px;
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

function Card({ w }: { w: WorkLite }) {
  return (
    <div className="cardWrap">
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
  );
}
