"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

type Mode = "all" | "sellable";

/**
 * ここで「シリーズ順」を固定する（Netflixの棚順）
 * seriesキーは短いの推奨："964" / "dino" / "gt350h" / "f100" / "bronco" / "moto"
 */
const SERIES_ORDER = ["dino", "gt350h", "964", "f100", "bronco", "moto"] as const;

const SERIES_LABEL: Record<string, { title: string; subtitle?: string }> = {
  dino: { title: "Dino 246 GT" },
  gt350h: { title: "Shelby GT350H" },
  "964": { title: "Porsche 964" },
  f100: { title: "Ford F-100" },
  bronco: { title: "Ford Bronco" },
  moto: { title: "Motorcycles" },
  other: { title: "Other" },
};

function getSeriesKey(w: any): string {
  // ✅推奨：WORKSに series が入っている前提
  // 無い場合のフォールバックも一応用意
  const s = String(w.series ?? "").trim();
  if (s) return s;

  // genreを流用してるならここで吸収（例: "964" とか）
  const g = String(w.genre ?? "").trim();
  if (g) return g;

  return "other";
}

function isSellable(w: any) {
  return Boolean(w?.stripePriceId);
}

export default function WorksClient() {
  const [mode, setMode] = useState<Mode>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const all = useMemo(() => {
    // all/sellable フィルタだけ適用（ランダムは消す：戻る挙動崩壊の原因になりやすい）
    const base = mode === "sellable" ? WORKS.filter(isSellable) : WORKS;

    // series別にグルーピング
    const map = new Map<string, any[]>();
    for (const w of base) {
      const key = getSeriesKey(w);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }

    // 各シリーズ内：販売中→先頭、残りは元順（安定）
    const groups = Array.from(map.entries()).map(([key, items]) => {
      const sellable = items.filter(isSellable);
      const others = items.filter((x) => !isSellable(x));
      return [key, [...sellable, ...others]] as const;
    });

    // シリーズ順を固定
    const orderIndex = (k: string) => {
      const i = (SERIES_ORDER as readonly string[]).indexOf(k);
      return i === -1 ? 999 : i;
    };
    groups.sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]));

    return groups;
  }, [mode]);

  const totalCount = useMemo(() => all.reduce((acc, [, items]) => acc + items.length, 0), [all]);

  return (
    <div style={{ marginTop: 18 }}>
      {/* 上部コントロール（最小） */}
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
          {mode === "sellable" ? "Sellable only" : "All"}
          <br />
          <span style={{ opacity: 0.7 }}>{totalCount} frames</span>
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
            All
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
            Sellable
          </button>
        </div>
      </div>

      {/* Netflix棚（縦にレーン / 横にスクロール） */}
      <div style={{ marginTop: 18, display: "grid", gap: 26 }}>
        {all.map(([seriesKey, items]) => {
          const meta = SERIES_LABEL[seriesKey] ?? SERIES_LABEL.other;
          const isOpen = Boolean(expanded[seriesKey]);

          // 1レーンの初期表示枚数（Netflixの「棚」）
          const PREVIEW = 10;
          const shown = isOpen ? items : items.slice(0, PREVIEW);
          const remaining = Math.max(0, items.length - shown.length);

          return (
            <section key={seriesKey}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, opacity: 0.72, letterSpacing: "0.12em" }}>SERIES</div>
                  <div style={{ fontSize: 18, fontWeight: 500, marginTop: 6 }}>{meta.title}</div>
                  {meta.subtitle && (
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{meta.subtitle}</div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: "0.08em" }}>
                    {items.length} frames
                  </div>

                  {/* レーン展開：同ページ内で縦グリッド化せず、レーン内の表示数だけ増やす */}
                  {items.length > PREVIEW && (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => setExpanded((m) => ({ ...m, [seriesKey]: !isOpen }))}
                      style={{ borderRadius: 0 }}
                      aria-label={isOpen ? "Close" : "More"}
                    >
                      {isOpen ? "Close" : "More"}
                    </button>
                  )}
                </div>
              </div>

              <div className="rail" aria-label={`${meta.title} row`}>
                {shown.map((w: any) => (
                  <div key={w.slug} className="cardWrap" style={{ position: "relative" }}>
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
                          alt={w.title ?? w.slug}
                          className="img"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>

                      <div className="meta">
                        <div className="title">{w.title ?? w.slug}</div>
                        <div className="sub">
                          {w.stripePriceId ? "販売中" : "準備中"} {" · "}¥
                          {Number(w.price ?? 0).toLocaleString("ja-JP")}
                        </div>
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

              {remaining
