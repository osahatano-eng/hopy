"use client";

import { useState } from "react";

type Props = {
  slug: string;
  disabled?: boolean;
};

export default function BuyNowClient({ slug, disabled }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onBuy() {
    if (disabled || busy) return;
    setMsg("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.set("slug", slug);

      const res = await fetch("/api/checkout", {
        method: "POST",
        body: fd,
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

  return (
    <div>
      <button className="btn btnPrimary" type="button" onClick={onBuy} disabled={disabled || busy}>
        {busy ? "処理中..." : "購入してダウンロード"}
      </button>

      {msg ? (
        <div style={{ marginTop: 10, fontSize: 12, color: "#ffb4b4", whiteSpace: "pre-wrap" }}>
          {msg}
        </div>
      ) : null}
    </div>
  );
}
