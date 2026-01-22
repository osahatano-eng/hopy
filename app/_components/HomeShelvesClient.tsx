"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FavoriteButton from "@/app/_components/FavoriteButton";

type WorkLite = {
  slug: string;
  image: string; // 例: "/works/fuxp1un3.png" のようなURL
  series: string;
  stripePriceId: string;
  price: number;

  // あれば使う（無くてもOK）
  updatedAt?: string;
  createdAt?: string;
  ts?: number;
};

type SeriesDef = { key: string; label: string };

const SERIES_ORDER: SeriesDef[] = [
  { key: "ferrari", label: "Ferrari" },
  { key: "porsche", label: "Porsche" },
  { key: "ford", label: "Ford" },
  { key: "moto", label: "Motorcycles" },
];

const OTHER_SERIES_KEY = "__other__";
const OTHER_SERIES_LABEL = "Other";

// 1棚あたりの初期表示枚数（横スクロールなので“多すぎない”が正義）
const SHELF_LIMIT = 12;

/**
 * Recommended棚の固定リスト（ここを書き換えればいつでも差し替え可能）
 * - 先頭から順番に表示
 * - works の image（URL文字列）の「末尾ファイル名」で照合する
 *   例: "/works/fuxp1un3.png" でも "fuxp1un3.png" でも一致
 */
const RECOMMENDED_FILES = [
  "fuxp1un3.png",
  "lpv0bvsw.png",
  "j0writd2.png",
  "58jp6ymz.png",
  "p2ysb4km.png",
  "0xl7t7xl.png",
] as const;

function fileNameFromPath(p: string) {
  const s = (p ?? "").trim();
  if (!s) return "";
  const noQuery = s.split("?")[0];
  const parts = noQuery.split("/");
  return parts[parts.length - 1] ?? "";
}

function bySellableFirstStable(list: WorkLite[]) {
  const sellable = list.filter((w) => Boolean(w.stripePriceId));
  const others = list.filter((w) => !Boolean(w.stripePriceId));
  return [...sellable, ...others];
}

export default function HomeShelvesClient({ works }: { works: WorkLite[] }) {
  // Recommended棚：固定ファイル名順でピック（sellableのみを優先・ただし無ければ表示しない）
  const recommendedList = useMemo(() => {
    const byFile = new Map<string, WorkLite[]>();
    for (const w of works) {
      const fn = fileNameFromPath(w.image);
      if (!fn) continue;
      if (!byFile.has(fn)) byFile.set(fn, []);
      byFile.get(fn)!.push(w);
    }

    const picked: WorkLite[] = [];
    for (const fn of RECOMMENDED_FILES) {
      const candidates = byFile.get(fn) ?? [];
      if (candidates.length === 0) continue;

      // 同じ画像ファイル名が複数slugに紐づく可能性があるので、
      // 基本は sellable を優先して 1つ選ぶ
      const sellable = candidates.find((x) => Boolean(x.stripePriceId));
      picked.push(sellable ?? candidates[0]);
    }

    // 念のため：sellable → others の並びに整形（ただし順番は固定リストが最優先）
    // 固定順を壊したくないので、ここでは並び替えない。
    return picked;
  }, [works]);

  // 以降の棚（シリーズ棚）は従来通り：sellable優先で “それっぽく” 並べる
  const baseList = useMemo(() => {
    // ここは Recommended と独立。並びの根拠は「sellableを前」に寄せるだけ。
    return bySellableFirstStable(works);
  }, [works]);

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
    <div className="homeShelves">
      {/* Recommended（入口棚：固定順） */}
      <section className="shelf shelfIntro">
        <div className="shelfHead">
          <div className="shelfTitle">Recommended</div>
          <div className="shelfSub">Start here.</div>
        </div>

        <div className="rail" aria-label="recommended">
          {recommendedList.length > 0 ? (
            recommendedList.map((w) => <Card key={w.slug} w={w} />)
          ) : (
            // 何も拾えない時の保険（空棚回避）
            baseList
              .filter((w) => Boolean(w.stripePriceId))
              .slice(0, 12)
              .map((w) => <Card key={w.slug} w={w} />)
          )}
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
        /* SiteFrame との間（container内の余白を整える） */
        .homeShelves{
          padding-top: 18px;
        }
        @media (min-width: 920px){
          .homeShelves{
            padding-top: 22px;
          }
        }

        .shelf{ margin-top: 22px; }
        .shelf:first-child{ margin-top: 0; }

        /* 入口棚は少しだけ空気を足す（ヒーロー直下の“詰まり”解消） */
        .shelfIntro{
          margin-top: 6px;
        }
        @media (min-width: 920px){
          .shelfIntro{
            margin-top: 10px;
          }
        }

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
          -ms-overflow-style: none;   /* IE/旧Edge */
          scrollbar-width: none;
          -webkit-mask-image: linear-gradient(
            to right,
            #000 0%,
            #000 88%,
            rgba(0,0,0,0.6) 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            #000 0%,
            #000 88%,
            rgba(0,0,0,0.6) 94%,
            transparent 100%
          );
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
      <a href={`/p/${w.slug}`} className="featuredTile">
        <div className="frame">
          <img src={w.image} alt={w.slug} className="img" />
        </div>
      </a>

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
