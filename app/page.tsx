"use client";

import Link from "next/link";
import { useMemo } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

/** ★ここを書き換えるだけで並び替えできる（最大12） */
const HOME_FIXED_IDS = [
  "949vogeu",
  "37z1mdu6",
  "0xl7t7xl",
  "8a24swce",
  "hty8ut3e","use client";

import Link from "next/link";
import { useMemo } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

/** ★ここを書き換えるだけで並び替え（最大12） */
const HOME_FIXED_IDS = [
  "949vogeu",
  "37z1mdu6",
  "0xl7t7xl",
  "8a24swce",
  "hty8ut3e",
  "up73h59u",
  "y8durmct",
  "e1c8e0le",
  "3nrqtvl7",
  "r8gor02s",
  "7yknd8pc",
  "g4tywz0w",
  // ここに8桁IDを並べる
];

function pickHomeByIds(ids: string[]) {
  const map = new Map(WORKS.map((w: any) => [w.slug, w]));
  const picked: any[] = [];

  for (const id of ids) {
    const w = map.get(id);
    if (w) picked.push(w);
    if (picked.length >= 12) break;
  }

  return picked;
}

export default function HomePage() {
  const fixedWorks = useMemo(() => pickHomeByIds(HOME_FIXED_IDS), []);

  return (
    <SiteFrame>
      <main>
        {/* Hero：class だけ残す（余白は globals.css で制御） */}
        <section className="heroMinimal">
          <div className="container">
            <div className="kicker">AI VISUAL STUDIO</div>
            <h1 className="h1">Silent Start</h1>
          </div>
        </section>

        {/* 画像グリッド（無言・固定12） */}
        <section className="section" style={{ paddingTop: 22 }}>
          <div className="container">
            <div className="featuredGrid">
              {fixedWorks.map((w: any) => (
                <div key={w.slug} style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
                    className="featuredTile"
                    style={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderRadius: 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div className="featuredFrame">
                      <img
                        src={w.image}
                        alt={w.slug}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  </Link>

                  {/* 右上：お気に入り（押してもリンクへ飛ばない） */}
                  <div
                    style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    <FavoriteButton slug={w.slug} compact size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ▼ 注意：ここには .heroMinimal のCSSは置かない（競合防止） */}
          <style>{`
            .featuredGrid{
              display:grid;
              grid-template-columns: repeat(2, minmax(0,1fr));
              gap: 12px;
            }

            @media (min-width: 920px){
              .featuredGrid{
                grid-template-columns: repeat(4, minmax(0,1fr));
                gap: 14px;
              }
            }

            .featuredFrame{
              width: 100%;
              aspect-ratio: 9 / 16;
              overflow: hidden;
              background: rgba(242,242,242,0.05);
            }
          `}</style>
        </section>
      </main>
    </SiteFrame>
  );
}

  "up73h59u",
  "y8durmct",
  "e1c8e0le",
  "3nrqtvl7",
  "r8gor02s",
  "7yknd8pc",
  "g4tywz0w",
  // "........",
];

function pickHomeByIds(ids: string[]) {
  const map = new Map(WORKS.map((w: any) => [w.slug, w]));
  const picked: any[] = [];

  for (const id of ids) {
    const w = map.get(id);
    if (w) picked.push(w);
    if (picked.length >= 12) break;
  }

  return picked;
}

export default function HomePage() {
  const fixedWorks = useMemo(() => pickHomeByIds(HOME_FIXED_IDS), []);

  return (
    <SiteFrame>
      <main>
        <section className="heroMinimal">
          <div className="container">
            <div className="kicker">AI VISUAL STUDIO</div>
            <h1 className="h1">Silent Start</h1>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 22 }}>
          <div className="container">
            <div className="featuredGrid">
              {fixedWorks.map((w: any) => (
                <div key={w.slug} style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
                    className="featuredTile"
                    style={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderRadius: 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div className="featuredFrame">
                      <img
                        src={w.image}
                        alt={w.slug}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  </Link>

                  <div
                    style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    <FavoriteButton slug={w.slug} compact size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            .heroMinimal{
              padding: 78px 0 18px;
            }

            .featuredGrid{
              display:grid;
              grid-template-columns: repeat(2, minmax(0,1fr));
              gap: 12px;
            }

            @media (min-width: 920px){
              .featuredGrid{
                grid-template-columns: repeat(4, minmax(0,1fr));
                gap: 14px;
              }
            }

            .featuredFrame{
              width: 100%;
              aspect-ratio: 9 / 16;
              overflow: hidden;
              background: rgba(242,242,242,0.05);
            }
          `}</style>
        </section>
      </main>
    </SiteFrame>
  );
}
