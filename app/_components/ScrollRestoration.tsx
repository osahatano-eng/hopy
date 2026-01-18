"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const keyFor = (path: string) => `hopy:scroll:${path}`;
const flagFor = (path: string) => `hopy:restore:${path}`;

function getNavType(): string {
  try {
    const nav = performance.getEntriesByType("navigation")?.[0] as any;
    return nav?.type || "navigate";
  } catch {
    return "navigate";
  }
}

export default function ScrollRestoration() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  // パスが変わったらref更新
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // ブラウザ任せをやめる
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    // ---- 保存（スクロール中ずっと）----
    let ticking = false;
    const save = () => {
      try {
        sessionStorage.setItem(keyFor(pathnameRef.current), String(window.scrollY || 0));
      } catch {}
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        save();
      });
    };

    const onPageHide = () => save();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);

    // ---- 復元フラグ（右スワイプ戻る = popstate / pageshow）----
    const markRestore = () => {
      try {
        // popstate後は location.pathname が「戻った先」になっている
        sessionStorage.setItem(flagFor(location.pathname), "1");
      } catch {}
    };

    const onPopState = () => markRestore();

    const onPageShow = (e: PageTransitionEvent) => {
      // bfcache復帰なら復元を必ず試す
      if (e.persisted) markRestore();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // ---- ページ表示時に復元（pathnameが確定してから）----
  useEffect(() => {
    const path = pathname;

    let shouldRestore = false;
    try {
      const navType = getNavType();
      const flagged = sessionStorage.getItem(flagFor(path)) === "1";
      // iOS swipe/back_forward or 明示フラグ時だけ復元
      shouldRestore = navType === "back_forward" || flagged;
      if (flagged) sessionStorage.removeItem(flagFor(path));
    } catch {}

    if (!shouldRestore) return;

    let y = 0;
    try {
      const raw = sessionStorage.getItem(keyFor(path));
      y = raw ? Number(raw) : 0;
    } catch {}

    // レイアウト確定待ち（iOS対策で複数回）
    requestAnimationFrame(() => window.scrollTo(0, y));
    setTimeout(() => window.scrollTo(0, y), 0);
    setTimeout(() => window.scrollTo(0, y), 80);
    setTimeout(() => window.scrollTo(0, y), 200);
  }, [pathname]);

  return null;
}
