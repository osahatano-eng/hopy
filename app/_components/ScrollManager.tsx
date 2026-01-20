"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TOP_KEY = "hopy_scroll_top_y";

function isDetail(pathname: string) {
  return pathname.startsWith("/p/");
}

export default function ScrollManager() {
  const pathname = usePathname();

  // トップのスクロール位置を保存
  useEffect(() => {
    const onScroll = () => {
      if (pathname === "/") {
        sessionStorage.setItem(TOP_KEY, String(window.scrollY || 0));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // ルート遷移時のスクロール制御（通常遷移）
  useEffect(() => {
    if (isDetail(pathname)) {
      requestAnimationFrame(() => window.scrollTo(0, 0));
      setTimeout(() => window.scrollTo(0, 0), 0);
      return;
    }

    if (pathname === "/") {
      const saved = Number(sessionStorage.getItem(TOP_KEY) || "0");
      requestAnimationFrame(() => window.scrollTo(0, saved));
      setTimeout(() => window.scrollTo(0, saved), 0);
    }
  }, [pathname]);

  // iPhone右スワイプ戻る（BFCache復元）対策
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        const p = window.location.pathname;

        if (p.startsWith("/p/")) {
          window.scrollTo(0, 0);
          setTimeout(() => window.scrollTo(0, 0), 0);
        } else if (p === "/") {
          const saved = Number(sessionStorage.getItem(TOP_KEY) || "0");
          window.scrollTo(0, saved);
          setTimeout(() => window.scrollTo(0, saved), 0);
        }
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // ブラウザの自動復元を抑える（効く環境では効く）
  useEffect(() => {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    } catch {}
  }, []);

  return null;
}
