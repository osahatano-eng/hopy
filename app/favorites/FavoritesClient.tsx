"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WORKS } from "@/lib/works";

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}

// localStorage内から「お気に入りslug配列っぽいもの」を自動検出する
function detectFavoriteSlugs(): string[] {
  try {
    const allSlugs = new Set(WORKS.map((w) => w.slug));
    const candidates: { key: string; slugs: string[] }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          const filtered = parsed.filter((s) => allSlugs.has(s));
          if (filtered.length > 0 && filtered.length === parsed.length) {
            candidates.push({ key, slugs: filtered });
          }
        }
      } catch {
        // ignore
      }
    }

    // いちばん長い配列を採用
    candidates.sort((a, b) => b.slugs.length - a.slugs.length);
    return candidates[0]?.slugs ?? [];
  } catch {
    return [];
  }
}

// Favoritesの保存先キーを推定（detectと同じロジックで「採用されたキー」を返す）
function detectFavoriteStorageKey(): string | null {
  try {
    const allSlugs = new Set(WORKS.map((w) => w.slug));
    const candidates: { key: string; len: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          const filtered = parsed.filter((s) => allSlugs.has(s));
          if (filtered.length > 0 && filtered.length === parsed.length) {
            candidates.push({ key, len: filtered.length });
          }
        }
      } catch {
        // ignore
      }
    }

    candidates.sort((a, b) => b.len - a.len);
    return candidates[0]?.key ?? null;
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

    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
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
          typeof data?.message === "string" && data.message.trim().length > 0
            ? data.message
            : null;

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

  // ✅ ここが本命：Favoritesページ内で「解除」を即時反映（画像消える＆合計も即更新）
  function removeFromFavorites(slug: string) {
    // 1) 画面を即更新（これで画像/件数/合計がリアルタイムに変わる）
    setSlugs((prev) => prev.filter((s) => s !== slug));

    // 2) localStorageも確実に更新（次回リロードでも残らない）
    try {
      const key = detectFavoriteStorageKey();
      if (!key) return;

      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) {
        const next = arr.filter((s) => s !== slug);
        localStorage.setItem(key, JSON.stringify(next));
      }

      // 同一タブ内の他コンポーネントがstorageイベントを待ってる場合の保険
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.12)", padding: 18 }}>
        <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 1 }}>FAVORITES</div>
        <h1 style={{ margin: "6px 0 12px", fontSize: 28 }}>保存したフレーム</h1>

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

          <button className="btn" type="button" onClick={() => setSlugs(detectFavoriteSlugs())} style={{ borderRadius: 0 }}>
            更新
          </button>

          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {items.length}件 / 販売中 {sellable.length}件
          </div>
        </div>

        {msg ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "#ffb4b4", whiteSpace: "pre-wrap" }}>{msg}</div>
        ) : null}
      </div>

      <div className="fullBleed" style={{ marginTop: 16 }}>
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
                <div style={{ width: "100%", aspectRatio: "4 / 5" }}>
                  <img
                    src={w.image}
                    alt={w.slug}
                    className="shortsImg"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              </Link>

              {/* ✅ Favorites内専用：クリックで即解除（表示も合計も即変わる） */}
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
                }}
                title="お気に入り解除"
              >
                ♡
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
