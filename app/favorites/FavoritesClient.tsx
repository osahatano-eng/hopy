"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";
import { FAVORITES_EVENT, getFavoriteSlugs } from "@/app/_lib/favorites";

export default function FavoritesClient() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSlugs(getFavoriteSlugs());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_EVENT, sync);
  }, []);

  // ★works と同じ配列（WORKS）から、保存済みslugだけ拾う
  const items = useMemo(() => {
    const set = new Set(slugs);
    return WORKS.filter((w) => set.has(w.slug));
  }, [slugs]);

  // ★合計金額（表示用）
  const totalYen = useMemo(() => {
    return items.reduce((sum, w) => sum + Number((w as any).price ?? 0), 0);
  }, [items]);

  if (items.length === 0) {
    return (
      <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75, lineHeight: 1.8 }}>
        まだ保存はありません。
        <br />
        <Link href="/works" className="navLink">
          作品一覧へ
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      {/* 上部：CTA帯（世界観を壊さず、でも強い） */}
      <div
        style={{
          marginTop: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.12)",
          padding: 16,
          borderRadius: 0,
        }}
      >
        <div className="kicker">Next step</div>

        <div style={{ marginTop: 10, fontSize: 18, fontWeight: 500, lineHeight: 1.4 }}>
          保存した中から、買う。
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8, lineHeight: 1.8 }}>
          ここは“買う候補”の棚です。
          <br />
          迷ったら、いったん全部買う。後悔しない。
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* ★全部購入（合計表示） */}
          <form action="/api/checkout-bundle" method="POST">
            <input type="hidden" name="slugs" value={items.map((x) => x.slug).join(",")} />
            <button className="btn btnPrimary" style={{ borderRadius: 0 }} type="submit">
              全部購入（¥{totalYen.toLocaleString("ja-JP")}）
            </button>
          </form>

          <Link className="btn" href="/works" style={{ borderRadius: 0, opacity: 0.9 }}>
            作品を追加で探す
          </Link>

          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {items.length}件 / 合計 ¥{totalYen.toLocaleString("ja-JP")}
          </div>
        </div>
      </div>

      {/* ★worksと同じ：fullBleed + shortsGrid で固定 */}
      <div className="fullBleed" style={{ marginTop: 16 }}>
        <div className="shortsGrid">
          {items.map((w) => {
            const canBuy = Boolean((w as any).stripePriceId);

            return (
              <div key={w.slug} style={{ position: "relative" }}>
                <Link
                  href={`/p/${w.slug}`}
                  className="shortsTile"
                  style={{
                    position: "relative",
                    display: "block",
                    overflow: "hidden",
                    borderRadius: 0,
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                  aria-label={`Open ${w.slug}`}
                >
                  <div style={{ width: "100%", aspectRatio: "4 / 5" }}>
                    <img
                      src={w.image}
                      alt={w.slug}
                      className="shortsImg"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: 0,
                        filter: "brightness(1.05)",
                      }}
                    />
                  </div>

                  {/* 購入可能（あなたの運用だと基本全部） */}
                  {canBuy ? (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        padding: "6px 10px",
                        borderRadius: 0,
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(11,12,15,0.55)",
                        backdropFilter: "blur(8px)",
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(242,242,242,0.92)",
                      }}
                      aria-hidden="true"
                    >
                      Buy
                    </div>
                  ) : null}
                </Link>

                {/* 右上：お気に入り（枠なし・ハートだけ） */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 3,
                  }}
                  onClick={(e) => e.preventDefault()}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  <FavoriteButton slug={w.slug} compact size={18} />
                </div>

                {/* 販売中だけ点（左上） */}
                {canBuy ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(242,242,242,0.85)",
                      boxShadow: "0 0 0 2px rgba(11,12,15,0.55)",
                      zIndex: 2,
                    }}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* PC hover：少し明転 */}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .shortsTile:hover .shortsImg { filter: brightness(1.14); }
        }
      `}</style>
    </div>
  );
}
