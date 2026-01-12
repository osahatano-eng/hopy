"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { setFavoriteSlugs } from "@/app/_lib/favorites";

type Item = {
  slug: string;
  image: string;
  title: string;
};

function getSessionIdFromUrl() {
  if (typeof window === "undefined") return "";
  const sp = new URLSearchParams(window.location.search);
  return String(sp.get("session_id") ?? "").trim();
}

export default function SuccessClient({ sessionId }: { sessionId?: string }) {
  const sid = useMemo(() => (sessionId?.trim() ? sessionId.trim() : getSessionIdFromUrl()), [sessionId]);

  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  useEffect(() => {
    // 成功ページに来たらお気に入りを空に（UX）
    setFavoriteSlugs([]);

    const run = async () => {
      if (!sid) {
        setStatus("err");
        return;
      }

      setStatus("loading");
      try {
        const res = await fetch(`/api/purchases?session_id=${encodeURIComponent(sid)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "failed");

        setItems(json.items || []);
        setStatus("ok");
      } catch {
        setStatus("err");
      }
    };

    run();
  }, [sid]);

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.12)",
          padding: 16,
          borderRadius: 0,
        }}
      >
        <div className="kicker">Download</div>

        {status === "loading" && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>読み込み中...</div>
        )}

        {status === "err" && (
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
            ダウンロード一覧を取得できませんでした。
            <br />
            <span style={{ opacity: 0.7 }}>session_id が取得できているか確認してください。</span>
            <br />
            <span style={{ opacity: 0.7 }}>
              （いまの session_id: {sid ? sid : "なし"}）
            </span>
          </div>
        )}

        {status === "ok" && (
          <>
            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>{items.length}件のダウンロード</div>

            <div className="fullBleed" style={{ marginTop: 14 }}>
              <div className="shortsGrid">
                {items.map((it) => (
                  <div key={it.slug} style={{ position: "relative" }}>
                    <div
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
                          src={it.image}
                          alt={it.title}
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

                      <Link
                        href={`/download/${it.slug}?session_id=${encodeURIComponent(sid)}`}
                        className="btn btnPrimary"
                        style={{
                          position: "absolute",
                          bottom: 10,
                          left: 10,
                          borderRadius: 0,
                          padding: "10px 12px",
                        }}
                      >
                        Download
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btnPrimary" href="/works" style={{ borderRadius: 0 }}>
            作品を見る
          </Link>
          <Link className="btn" href="/favorites" style={{ borderRadius: 0, opacity: 0.9 }}>
            お気に入りへ
          </Link>
        </div>
      </div>
    </div>
  );
}
