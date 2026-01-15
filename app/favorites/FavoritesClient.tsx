"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import { FAVORITES_EVENT } from "@/app/_lib/favorites";

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

// localStorage内から「お気に入りslug配列っぽいもの」を自動検出する
function detectFavoriteSlugs(): string[] {
  try {
    const allSlugs = new Set(WORKS.map((w) => w.slug));
    const candidates: string[][] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          const filtered = parsed.filter((s) => allSlugs.has(s));
          if (filtered.length > 0 && filtered.length === parsed.length) candidates.push(filtered);
        }
      } catch {
        // ignore
      }
    }

    candidates.sort((a, b) => b.length - a.length);
    return candidates[0] ?? [];
  } catch {
    return [];
  }
}

// ✅ 「このslugを持っている」localStorageキーを特定する（0件になっても確実に更新できる）
function findFavoritesStorageKeyBySlug(targetSlug: string): string | null {
  try {
    const allSlugs = new Set(WORKS.map((w) => w.slug));

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          const filtered = parsed.filter((s) => allSlugs.has(s));
          if (filtered.length === parsed.length && parsed.includes(targetSlug)) {
            return key;
          }
        }
      } catch {
        // ignore
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function FavoritesClient() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // 初回＆タブ復帰で必ず読み直す
  useEffect(() => {
    const refresh = () => setSlugs(detectFavoriteSlugs());
    refresh();

    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);

    // 他タブからの変更
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);

    // 同一タブの Favorites 更新（FavoritesCount が見ているイベント）
    const onFavChanged = () => refresh();
    window.addEventListener(FAVORITES_EVENT, onFavChanged);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FAVORITES_EVENT, onFavChanged);
    };
  }, []);

  const items = useMemo(
    () => slugs.map((s) => WORKS.find((w) => w.slug === s)).filter(Boolean),
    [slugs]
  );

  const sellable = useMemo(
    () => items.filter((w: any) => typeof w.stripePriceId === "string" && w.stripePriceId.length > 0),
    [items]
  );

  const totalYen = useMemo(
    () => sellable.reduce((sum: number, w: any) => sum + (typeof w.price === "number" ? w.price : 0), 0),
    [sellable]
  );

  async function checkoutAll() {
    setMsg("");
    if (busy) return;

    const sellableSlugs = sellable.map((w: any) => w.slug);
    if (sellableSlugs.length === 0) {
      setMsg("販売中の作品がありません（お気に入りが空 or stripePriceIdがWORKSに載っていません）");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/checkout-bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: sellableSlugs }),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok || !data?.url) {
        const apiMsg =
          typeof data?.message === "string" && data.message.trim().length > 0 ? data.message : null;

        setMsg(apiMsg ?? `購入開始に失敗: ${data?.error ?? "unknown_error"}（status ${res.status}）`);
        return;
      }

      window.location.assign(data.url);
    } catch (e: any) {
      setMsg(`通信エラー: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  // ✅ 解除した瞬間に「画像も合計もヘッダー数字も」全部リアルタイム更新
  function removeFromFavorites(slug: string) {
    // 1) 画面を即更新
    setSlugs((prev) => prev.filter((s) => s !== slug));

    // 2) localStorage を確実に更新
    try {
      const key = findFavoritesStorageKeyBySlug(slug);
      if (key) {
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          const next = arr.filter((s) => s !== slug);
          localStorage.setItem(key, JSON.stringify(next));
        }
      }
    } catch {
      // ignore
    }

    // 3) ヘッダーの数字へ即通知
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.12)", padding: 18 }}>
        <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1 }}>FAVORITES</div>
        <h1 style={{ margin: "6px 0 12px", fontSize: 28 }}>お気に入りフレーム</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btnPrimary"
            type="button"
            onClick={checkoutAll}
            disabled={busy}
            style={{ borderRadius: 0 }}
          >
            {busy ? "処理中..." : `全部購入（¥${yen(totalYen)}）`}
          </button>

          <Link className="btn" href="/works" style={{ borderRadius: 0 }}>
            作品を追加して探す
          </Link>

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {items.length}件 / 販売中 {sellable.length}件
          </div>
        </div>

        {msg ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "#ffb4b4", whiteSpace: "pre-wrap" }}>{msg}</div>
        ) : null}
      </div>

      {/* ✅ fullBleed を外して、Worksと同じ「2列→4列」グリッドに */}
      <div style={{ marginTop: 16 }}>
        <div className="shortsGrid">
          {items.map((w: any) => (
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
              >
                <div style={{ width: "100%", aspectRatio: "9 / 16" }}>
                  <img
                    src={w.image}
                    alt={w.slug}
                    className="shortsImg"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              </Link>

              {/* ✅ 塗りハート（♥）を押したら解除 → 即消える */}
              <button
                type="button"
                aria-label="お気に入り解除"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromFavorites(w.slug);
                }}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  width: 34,
                  height: 34,
                  borderRadius: 0,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(0,0,0,0.35)",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  lineHeight: 1,
                  fontSize: 18,
                }}
                title="お気に入り解除"
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ このページ内で Works と同じグリッド定義を持たせる */}
      <style>{`
        .shortsGrid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 12px;
        }

        @media (min-width: 920px){
          .shortsGrid{
            grid-template-columns: repeat(4, minmax(0,1fr));
            gap: 14px;
          }
        }

        /* PC hover：少し明転 */
        @media (hover: hover) and (pointer: fine) {
          .shortsTile:hover .shortsImg { filter: brightness(1.14); }
        }
      `}</style>
    </div>
  );
}


