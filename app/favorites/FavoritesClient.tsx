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
    const candidates: string[][] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      // JSON配列を試す
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          // WORKSのslugだけで構成されている配列を候補にする
          const filtered = parsed.filter((s) => allSlugs.has(s));
          if (filtered.length > 0 && filtered.length === parsed.length) candidates.push(filtered);
        }
      } catch {
        // ignore
      }
    }

    // いちばん長い配列を採用（お気に入りが増えても追従）
    candidates.sort((a, b) => b.length - a.length);
    return candidates[0] ?? [];
  } catch {
    return [];
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

    // storageイベント（別タブ操作にも追従）
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const items = useMemo(() => slugs.map((s) => WORKS.find((w) => w.slug === s)).filter(Boolean), [slugs]);

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
        // ✅ APIが返す message を最優先で表示（審査中ガード等）
        const apiMsg =
          typeof data?.message === "string" && data.message.trim().length > 0
            ? data.message
            : null;

        if (apiMsg) {
          setMsg(apiMsg);
        } else {
          setMsg(`購入開始に失敗: ${data?.error ?? "unknown_error"}（status ${res.status}）`);
        }
        return;
      }

      // ✅ Stripeへ確実に遷移
      window.location.assign(data.url);
    } catch (e: any) {
      setMsg(`通信エラー: ${e?.message ?? String(e)}`);
    } finally {
      setBusy(false);
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

          <button
            className="btn"
            type="button"
            onClick={() => setSlugs(detectFavoriteSlugs())}
            style={{ borderRadius: 0 }}
          >
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
            <Link
              key={w.slug}
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
          ))}
        </div>
      </div>
    </div>
  );
}
