"use client";

import { useEffect, useRef } from "react";

/**
 * iOSの右スワイプ戻る / BFCache / Next.js遷移でも
 * スクロール位置を sessionStorage に保存して復元する。
 */
export default function ScrollRestoration() {
  const keyRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ブラウザ標準の復元は Next の挙動と競合しがちなので手動に
    try {
      window.history.scrollRestoration = "manual";
    } catch {}

    const makeKey = () => {
      // pathnameごとに保存（必要なら search も含める）
      return `scroll:${window.location.pathname}`;
    };

    const save = () => {
      try {
        sessionStorage.setItem(makeKey(), String(window.scrollY || 0));
      } catch {}
    };

    const restore = () => {
      const k = makeKey();
      keyRef.current = k;

      let y = 0;
      try {
        y = Number(sessionStorage.getItem(k) ?? "0");
      } catch {}

      // 1回で効かない端末があるので、2フレーム＋少し遅延で押し切る
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
        requestAnimationFrame(() => window.scrollTo(0, y));
        setTimeout(() => window.scrollTo(0, y), 80);
      });
    };

    // 初回ロード時も復元（戻る直後もここを通ることが多い）
    restore();

    // 遷移前に保存（戻る用）
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);

    // iOSのBFCache復帰で発火。persisted=true の時は特に重要
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) restore();
    };
    window.addEventListener("pageshow", onPageShow);

    // スクロール中も定期保存（軽く）
    let t: any;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(save, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
      window.removeEventListener("pageshow", onPageShow as any);
      window.removeEventListener("scroll", onScroll as any);
      clearTimeout(t);
    };
  }, []);

  return null;
}
