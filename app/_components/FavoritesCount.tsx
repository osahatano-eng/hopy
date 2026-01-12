"use client";

import { useEffect, useState } from "react";
import { FAVORITES_EVENT, favoritesCount } from "@/app/_lib/favorites";

type Props = {
  prefix?: string;
};

export default function FavoritesCount({ prefix = "" }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(favoritesCount());
    sync();

    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  return (
    <span style={{ fontSize: 12, opacity: 0.8 }}>
      {prefix}
      {count}件保存中
    </span>
  );
}
