"use client";

import { useEffect, useState } from "react";
import { FAVORITES_EVENT, favoritesCount } from "@/app/_lib/favorites";

export default function FavoritesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(favoritesCount());
    sync();

    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        color: "rgba(242,242,242,0.92)",
        fontSize: 12,
        letterSpacing: "0.06em",
        userSelect: "none",
      }}
      aria-label={`お気に入り ${count}件`}
      title={`お気に入り ${count}件`}
    >
      <span style={{ transform: "translateY(-1px)" }}>♥</span>
      <span>{count}</span>
    </span>
  );
}
