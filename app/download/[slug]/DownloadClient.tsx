"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  slug: string;
  sessionId: string;
};

type PurchaseItem = {
  slug: string;
  image: string;
  title: string;
};

export default function DownloadClient({ slug, sessionId }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err" | "forbidden">("idle");
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!sessionId) {
        setStatus("forbidden");
        return;
      }

      setStatus("loading");
      try {
        const res = await fetch(`/api/purchases?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "failed");

        const list: PurchaseItem[] = (json.items || []).map((x: any) => ({
          slug: String(x.slug),
          image: String(x.image),
          title: String(x.title ?? x.slug),
        }));

        setItems(list);

        const allowed = list.some((x) => x.slug === slug);
        setStatus(allowed ? "ok" : "forbidden");
      } catch {
        setStatus("err");
      }
    };

    run();
  }, [sessionId, slug]);

  const current = useMemo(() => items.find((x) => x.slug === slug), [items, slug]);

  if (status === "loading") {
    return <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75 }}>確認中...</div>;
  }

  if (status === "err") {
    return (
      <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
        購入確認に失敗しました。
        <br />
        <span style={{ opacity: 0.7 }}>決済完了ページから来ているか確認してください。</span>
        <div style={{ marginTop: 14 }}>
          <Link className="btn" href="/works" style={{ borderRadius: 0 }}>
            作品を見る
          </Link>
        </div>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
        このダウンロードは許可されていません。
        <br />
        <span style={{ opacity: 0.7 }}>購入完了後のページからアクセスしてください。</span>
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btnPrimary" href="/works" style={{ borderRadius: 0 }}>
            作品を見る
          </Link>
          <Link className="btn" href="/favorites" style={{ borderRadius: 0, opacity: 0.9 }}>
            お気に入りへ
          </Link>
        </div>
      </div>
    );
  }

  // status === "ok"
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
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          ダウンロードできます
        </div>

        {current && (
          <div style={{ marginTop: 14 }}>
            <div
              className="shortsTile"
              style={{
                position: "relative",
                display: "block",
                overflow: "hidden",
                borderRadius: 0,
                border: "1px solid rgba(255,255,255,0.10)",
                maxWidth: 520,
              }}
            >
              <div style={{ width: "100%", aspectRatio: "4 / 5" }}>
                <img
                  src={current.image}
                  alt={current.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: "brightness(1.05)",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* ★実DLはAPIへ（購入確認つき） */}
              <a
                className="btn btnPrimary"
                style={{ borderRadius: 0 }}
                href={`/api/download?session_id=${encodeURIComponent(sessionId)}&slug=${encodeURIComponent(slug)}`}
              >
                Download
              </a>

              <Link
                className="btn"
                style={{ borderRadius: 0, opacity: 0.9 }}
                href={`/success?session_id=${encodeURIComponent(sessionId)}`}
              >
                ダウンロード一覧へ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
