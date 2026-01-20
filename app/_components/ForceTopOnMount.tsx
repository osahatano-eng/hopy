"use client";

import { useEffect } from "react";

export default function ForceTopOnMount() {
  useEffect(() => {
    // 詳細ページは常に先頭
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  return null;
}
