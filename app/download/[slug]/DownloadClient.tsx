"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function getSessionIdFromUrl() {
  if (typeof window === "undefined") return "";
  const sp = new URLSearchParams(window.location.search);
  return String(sp.get("session_id") ?? "").trim();
}

export default function DownloadClient({ slug }: { slug: string }) {
  const sid = useMemo(() => getSessionIdFromUrl(), []);
  const downloadUrl = useMemo(() => {
    if (!sid) return "";
    return `/api/download?session_id=${encodeURIComponent(sid)}&slug=${encodeURIComponent(slug)}`;
  }, [sid, slug]);

  const [phase, setPhase] = useState<"checking" | "started" | "err">("checking");

  useEffect(() => {
    if (!sid) {
      setPhase("err");
      return;
    }

    // 自動で開始
    window.location.href = downloadUrl;

    // 表示はすぐ切り替える（UX）
    const t = window.setTimeout(() => setPhase("started"), 350);
    return () => window.clearTimeout(t);
  }, [sid, downloadUrl]);

  if (phase === "err") {
    return (
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          Forbidden{"\n"}session_id がありません。
        </div>

        <div style={{ marginTop: 14 }}>
          <Link className="btn" href="/works" style={{ borderRadius: 0 }}>
            作品一覧へ
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "checking") {
    return (
      <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
        ダウンロードを開始しています…
      </div>
    );
  }

  // started
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
        ダウンロードを開始しました。
      </div>

      <div style={{ marginTop: 14 }}>
        <Link className="btn btnPrimary" href="/works" style={{ borderRadius: 0 }}>
          作品一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
