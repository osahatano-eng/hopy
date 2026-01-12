"use client";

import { useEffect, useMemo, useState } from "react";

function getSessionIdFromUrl() {
  if (typeof window === "undefined") return "";
  const sp = new URLSearchParams(window.location.search);
  return String(sp.get("session_id") ?? "").trim();
}

export default function DownloadClient({ slug }: { slug: string }) {
  const sid = useMemo(() => getSessionIdFromUrl(), []);

  const [msg, setMsg] = useState("確認中...");
  const [isErr, setIsErr] = useState(false);

  useEffect(() => {
    if (!sid) {
      setIsErr(true);
      setMsg("Forbidden\nsession_id がありません。");
      return;
    }

    // ★ここで直接 /api/download に飛ばす（購入チェックはAPI側がやる）
    const url = `/api/download?session_id=${encodeURIComponent(sid)}&slug=${encodeURIComponent(slug)}`;
    window.location.href = url;
  }, [sid, slug]);

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {msg}
        {isErr && (
          <div style={{ marginTop: 10, opacity: 0.7 }}>
            （いまの session_id: {sid ? sid : "なし"}）
          </div>
        )}
      </div>
    </div>
  );
}
