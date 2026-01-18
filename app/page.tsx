"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteFrame from "@/app/_components/SiteFrame";
import { WORKS } from "@/lib/works";
import FavoriteButton from "@/app/_components/FavoriteButton";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ★SSR/初回表示用（固定）
function pickFeaturedStable() {
  return [...WORKS]
    .sort((a, b) => Number(Boolean(b.stripePriceId)) - Number(Boolean(a.stripePriceId)))
    .slice(0, 8);
}

// ★クライアント側でだけランダム（販売中優先）
function pickFeaturedRandomStrong() {
  const sellable = shuffle(WORKS.filter((w) => Boolean(w.stripePriceId)));
  const others = shuffle(WORKS.filter((w) => !w.stripePriceId));
  const picked = [...sellable.slice(0, 6), ...others].slice(0, 8);
  return shuffle(picked);
}

const SCROLL_KEY = "hopy:home:scrollY";
const ORDER_KEY = "hopy:home:order"; // JSON: string[]
const RESTORE_FLAG = "hopy:home:restore"; // "1" のときだけ復元

function saveHomeState(orderSlugs: string[]) {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(orderSlugs));
    sessionStorage.setItem(RESTORE_FLAG, "1");
  } catch {}
}

function readRestoreFlag() {
  try {
    return sessionStorage.getItem(RESTORE_FLAG) === "1";
  } catch {
    return false;
  }
}

function consumeRestoreFlag() {
  try {
    sessionStorage.removeItem(RESTORE_FLAG);
  } catch {}
}

function readSavedScrollY(): number {
  try {
    const raw = sessionStorage.getItem(SCROLL_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function readSavedOrder(): string[] | null {
  try {
    const raw = sessionStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}

function buildWorksBySlugs(slugs: string[]): any[] | null {
  const map = new Map<string, any>();
  for (const w of WORKS as any[]) map.set(w.slug, w);

  const list: any[] = [];
  for (const s of slugs) {
    const w = map.get(s);
    if (w) list.push(w);
  }
  // 保存内容が古い/不足なら不採用
  if (list.length !== 8) return null;
  return list;
}

export default function HomePage() {
  const stable = useMemo(() => pickFeaturedStable(), []);
  const [featuredWorks, setFeaturedWorks] = useState<any[]>(stable);

  // 戻り復元中かどうか（この間はランダムしない）
  const [isRestoring, setIsRestoring] = useState(false);

  // 1) マウント時：復元フラグがあれば「並び」を先に復元、なければランダム
  useEffect(() => {
    // iOSの戻ると競合しないように
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    const shouldRestore = readRestoreFlag();
    if (shouldRestore) {
      setIsRestoring(true);
      const saved = readSavedOrder();
      const restored = saved ? buildWorksBySlugs(saved) : null;
      if (restored) {
        setFeaturedWorks(restored);
      } else {
        // 何かおかしい時は通常運転へ
        setFeaturedWorks(pickFeaturedRandomStrong());
        consumeRestoreFlag();
        setIsRestoring(false);
      }
      return;
    }

    // 通常訪問：ランダム
    setFeaturedWorks(pickFeaturedRandomStrong());
  }, []);

  // 2) 復元時：並びが入った「後」にスクロール復元
  useEffect(() => {
    if (!isRestoring) return;

    const y = readSavedScrollY();

    // 1フレーム待ってから戻す（画像の高さ確定待ち）
    requestAnimationFrame(() => window.scrollTo(0, y));
    // iOS対策で念押し
    setTimeout(() => window.scrollTo(0, y), 0);
    setTimeout(() => window.scrollTo(0, y), 60);

    consumeRestoreFlag();
    setIsRestoring(false);
  }, [isRestoring, featuredWorks]);

  // hover判定（あなたはhover不要と言っていたので、今後消してもOK）
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

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
              {featuredWorks.map((w: any) => (
                <div key={w.slug} style={{ position: "relative" }}>
                  <Link
                    href={`/p/${w.slug}`}
                    // 遷移前に「スクロール + 並び」を保存
                    onClick={() => saveHomeState(featuredWorks.map((x) => x.slug))}
                    className="featuredTile"
                    style={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderRadius: 0,
                      border: "1px solid rgba(255,255,255,0.10)",
                      transform: canHover ? "translateZ(0)" : undefined,
                    }}
                  >
                    <div className="featuredFrame">
                      <img
                        src={w.image}
                        alt={w.title ?? w.slug}
                        className="featuredImg"
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
