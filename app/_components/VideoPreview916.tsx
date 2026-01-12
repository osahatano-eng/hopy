"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
};

export default function VideoPreview916({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [hintVisible, setHintVisible] = useState(false);
  const [ready, setReady] = useState(false); // ← 読み込み完了フラグ

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onCanPlay = () => setReady(true);
    const onWaiting = () => setReady(false);

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("canplaythrough", onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);
    v.addEventListener("waiting", onWaiting);

    const tryPlay = async () => {
      try {
        await v.play();
        setIsPlaying(true);
        setHintVisible(false);
      } catch {
        // 自動再生できない環境 → 停止状態にしてヒントを出す
        setIsPlaying(false);
        setHintVisible(true);
      }
    };

    tryPlay();

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("canplaythrough", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      v.removeEventListener("waiting", onWaiting);
    };
  }, []);

  const showHintTemporarily = () => {
    setHintVisible(true);
    window.setTimeout(() => setHintVisible(false), 900);
  };

  const toggle = async () => {
    const v = videoRef.current;
    if (!v) return;

    try {
      if (v.paused) {
        await v.play();
        setIsPlaying(true);
        setHintVisible(false);
      } else {
        v.pause();
        setIsPlaying(false);
        setHintVisible(true);
      }
    } catch {
      setIsPlaying(!v.paused);
      setHintVisible(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => {
        if (isPlaying) showHintTemporarily();
      }}
      onFocus={() => {
        if (isPlaying) showHintTemporarily();
      }}
      aria-label={isPlaying ? "Pause video" : "Play video"}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
        background: "black", // ← 読み込み中の下地を固定（白フラッシュ防止）
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          background: "black",
          opacity: ready ? 1 : 0, // ← 準備できるまで見せない
          transition: "opacity .18s ease",
        }}
      />

      {/* 読み込み中の薄い表示（邪魔しない） */}
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(242,242,242,0.65)",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.25)",
              padding: "10px 14px",
              backdropFilter: "blur(6px)",
              userSelect: "none",
            }}
          >
            Loading
          </div>
        </div>
      )}

      {/* ヒント：停止中は常に表示 / 再生中は一瞬だけ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          opacity: hintVisible ? 1 : 0,
          transition: "opacity .18s ease",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            color: "rgba(242,242,242,0.92)",
            padding: "10px 14px",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          {isPlaying ? "Tap to pause" : "Tap to play"}
        </div>
      </div>
    </button>
  );
}
