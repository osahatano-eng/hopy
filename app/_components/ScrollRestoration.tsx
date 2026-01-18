"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const key = (p: string) => `hopy:scrollY:${p}`;
const flag = (p: string) => `hopy:restore:${p}`;

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // ブラウザ任せを切る
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    // 常時保存（軽量）
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        try {
          sessionStorage.setItem(key(location.pathname), String(window.scrollY || 0));
        } catch {}
      });
    };

    const onPopState = () => {
      try {
        sessionStorage.setItem(flag(location.pathname), "1");
      } catch {}
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        try {
          sessionStorage.setItem(flag(location.pathname), "1");
        } catch {}
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // パス確定後に “戻り時だけ” 復元
  useEffect(() => {
    let should = false;
    try {
      should = sessionStorage.getItem(flag(pathname)) === "1";
      if (should) sessionStorage.removeItem(flag(pathname));
    } catch {}

    if (!should) return;

    let y = 0;
    try {
      const raw = sessionStorage.getItem(key(pathname));
      y = raw ? Number(raw) : 0;
    } catch {}

    requestAnimationFrame(() => window.scrollTo(0, y));
    setTimeout(() => window.scrollTo(0, y), 0);
    setTimeout(() => window.scrollTo(0, y), 80);
    setTimeout(() => window.scrollTo(0, y), 200);
  }, [pathname]);

  return null;
}
