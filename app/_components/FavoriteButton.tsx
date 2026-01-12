"use client";

import { useEffect, useRef, useState } from "react";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/app/_lib/favorites";

type Props = {
  slug: string;
  size?: number; // ハート文字サイズ
  label?: boolean; // Save/Saved の文字を出す
  compact?: boolean; // サムネ用の小さいUI
};

export default function FavoriteButton({
  slug,
  size = 20,
  label = false,
  compact = false,
}: Props) {
  const [on, setOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => setOn(isFavorite(slug));
    sync();

    window.addEventListener(FAVORITES_EVENT, sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [slug]);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // ★スマホで親のLinkに吸われないようにする
    e.preventDefault();
    e.stopPropagation();

    const next = toggleFavorite(slug);
    setOn(next);

    // ★保存した瞬間だけ “Saved” をフラッシュ（外した時は出さない）
    if (next) {
      setFlash(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setFlash(false), 900);
    } else {
      setFlash(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? "お気に入りから外す" : "お気に入りに追加"}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: compact ? "8px 10px" : "10px 12px",
        border: "1px solid rgba(255,255,255,0.14)",
        background: compact ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.20)",
        color: "rgba(242,242,242,0.92)",
        cursor: "pointer",
        userSelect: "none",
        backdropFilter: compact ? "blur(6px)" : undefined,
        overflow: "hidden",
        borderRadius: 0,
      }}
    >
      <span
        style={{
          fontSize: size,
          lineHeight: 1,
          transform: "translateY(-1px)",
          opacity: on ? 1 : 0.75,
        }}
      >
        {on ? "♥" : "♡"}
      </span>

      {label && (
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          {on ? "Saved" : "Save"}
        </span>
      )}

      {/* ★フラッシュ演出（保存した瞬間だけ） */}
      {flash && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(242,242,242,0.08)",
            border: "1px solid rgba(242,242,242,0.18)",
            color: "rgba(242,242,242,0.95)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            animation: "sfFavFlash .9s ease forwards",
            pointerEvents: "none",
          }}
        >
          Saved
        </span>
      )}

      <style>{`
        @keyframes sfFavFlash {
          0%   { opacity: 0; transform: scale(0.98); }
          10%  { opacity: 1; transform: scale(1); }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: scale(1.02); }
        }
      `}</style>
    </button>
  );
}
