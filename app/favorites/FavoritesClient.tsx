"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

// localStorage の保存キー（もし既存が違うなら、ここだけ合わせればOK）
const FAVORITES_KEY = "favorites";

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

  // 初回ロード
  useEffect(() => {
    setSlugs(readFavorites());
  }, []);

  // 他タブ/他ページでお気に入り更新したとき追従
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) setSlugs(readFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const favoriteWorks = useMemo(() => {
    const set = new Set(slugs);
    return WORKS.filter((w: any) => set.has(w.slug));
  }, [slugs]);

  // 売れるやつ（stripePriceIdがあるやつ）
  const sellableWorks = useMemo(
    () => favoriteWorks.filter((w: any) => Boolean(w.stripePriceId)),
    [favoriteWorks]
  );

  const sellableSlugs = useMemo(() => sellableWorks.map((w: any) => w.slug), [sellableWorks]);

  // 合計（priceYen がある前提。無い場合は 0 扱い）
  const totalYen = useMemo(() => {
    return sellableWorks.reduce((sum: number, w: any) => sum + Number(w.priceYen ?? 0), 0);
  }, [sellableWorks]);

  async function buyAll() {
    // 売れるものが0なら、サーバーに行く前に止める
    if (sellableSlugs.length === 0) {
      alert("購入可能な作品がありません。");
      return;
    }

    const res = await fetch("/api/checkout-bundle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: sellableSlugs }),
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok || !data?.url) {
      alert(data?.error ?? "購入処理に失敗しました");
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

      {/* NEXT STEP box */}
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

      {/* grid */}
      <div className="fullBleed" style={{ marginTop: 18 }}>
        <div className="shortsGrid">
          {favoriteWorks.map((w: any) => (
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
                    src={w.image}
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

              {/* 右上：お気に入り */}
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
