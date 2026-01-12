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

    // 自動で開始（これでダウンロードが始まる）
    window.location.href = downloadUrl;

    // 画面表示はすぐ「開始しました」に変える（UX）
    const t = window.setTimeout(() => setPhase("started"), 350);
    return () => window.clearTimeout(t);
  }, [sid, downloadUrl]);

  if (phase === "err") {
    return (
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          Forbidden{"\n"}session_id がありません。
          <div style={{ marginTop: 10, opacity: 0.7 }}>（いまの session_id: なし）</div>
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
        <br />
        もし始まらない場合は、下のボタンからもう一度お試しください。
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a className="btn btnPrimary" href={downloadUrl} style={{ borderRadius: 0 }}>
          もう一度ダウンロード
        </a>
        <Link className="btn" href="/works" style={{ borderRadius: 0, opacity: 0.9 }}>
          作品一覧へ
        </Link>
      </div>
    </div>
  );
}
