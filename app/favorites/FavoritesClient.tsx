"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

// ★あなたのFavoriteButtonが使ってるキーが違う場合はここだけ合わせる
const FAVORITES_KEY = "favorites";

// WORKS要素型
type Work = (typeof WORKS)[number];

// stripePriceId / priceYen を「存在するなら読む」ための安全アクセサ
function getStripePriceId(w: unknown): string | null {
  if (!w || typeof w !== "object") return null;
  const v = (w as { stripePriceId?: unknown }).stripePriceId;
  return typeof v === "string" && v.length > 0 ? v : null;
}
function getPriceYen(w: unknown): number {
  if (!w || typeof w !== "object") return 0;
  const v = (w as { priceYen?: unknown }).priceYen;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default function FavoritesClient() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readFavorites());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) setSlugs(readFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const favoriteWorks: Work[] = useMemo(() => {
    const set = new Set(slugs);
    return WORKS.filter((w) => set.has(w.slug));
  }, [slugs]);

  const sellableWorks = useMemo(() => {
    return favoriteWorks.filter((w) => Boolean(getStripePriceId(w)));
  }, [favoriteWorks]);

  const sellableSlugs = useMemo(() => sellableWorks.map((w) => w.slug), [sellableWorks]);

  const totalYen = useMemo(() => {
    return sellableWorks.reduce((sum, w) => sum + getPriceYen(w), 0);
  }, [sellableWorks]);

  async function buyAll() {
    if (sellableSlugs.length === 0) {
      window.alert("購入可能な作品がありません。");
      return;
    }

    const res = await fetch("/api/checkout-bundle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: sellableSlugs }),
    });

    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

    if (!res.ok || !data.url) {
      window.alert(data.error ?? "購入処理に失敗しました");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.6 }}>
        <div style={{ letterSpacing: "0.12em" }}>FAVORITES</div>
        <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>保存したフレーム</div>
      </div>

      <div
        style={{
          marginTop: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          padding: 18,
          maxWidth: 980,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: "0.12em" }}>NEXT STEP</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>保存した中から、買う。</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8, lineHeight: 1.7 }}>
          ここは買う候補の“棚”です。
          <br />
          迷ったら、いったん全部買う。後悔しない。
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
          <button className="btn btnPrimary" type="button" onClick={buyAll} style={{ borderRadius: 0 }}>
            全部購入（¥{totalYen.toLocaleString("ja-JP")}）
          </button>

          <Link className="btn" href="/works" style={{ borderRadius: 0 }}>
            作品を追加で探す
          </Link>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {sellableWorks.length}件 / 合計 ¥{totalYen.toLocaleString("ja-JP")}
          </div>
        </div>
      </div>

      <div className="fullBleed" style={{ marginTop: 18 }}>
        <div className="shortsGrid">
          {favoriteWorks.map((w) => (
            <div key={w.slug} style={{ position: "relative" }}>
              <Link
                href={`/p/${w.slug}`}
                className="shortsTile"
                style={{
                  position: "relative",
                  display: "block",
                  overflow: "hidden",
                  borderRadius: 0,
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
                aria-label={`Open ${w.slug}`}
              >
                <div style={{ width: "100%", aspectRatio: "4 / 5" }}>
                  <img
                    src={(w as { image: string }).image}
                    alt={w.slug}
                    className="shortsImg"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: 0,
                      filter: "brightness(1.05)",
                    }}
                  />
                </div>
              </Link>

              <div
                style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}
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

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .shortsTile:hover .shortsImg { filter: brightness(1.14); }
        }
      `}</style>
    </div>
  );
}
