import Link from "next/link";
import { notFound } from "next/navigation";
import { WORKS } from "@/lib/works";
import SiteFrame from "@/app/_components/SiteFrame";
import VideoPreview916 from "@/app/_components/VideoPreview916";
import FavoriteButton from "@/app/_components/FavoriteButton";
import BuyNowClient from "@/app/_components/BuyNowClient";


type Params = { slug: string };
type Props = { params: Params | Promise<Params> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const w = WORKS.find((x) => x.slug === slug);
  if (!w) notFound();

  const videoSrc = (w as any).video as string | undefined;

  return (
    <SiteFrame>
      <main>
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div style={{ marginBottom: 16 }}>
              <Link href="/works" className="navLink">
                ← 作品一覧に戻る
              </Link>
            </div>

            <div className="productGrid">
              {/* 左：視覚（画像＋動画） */}
              <div className="leftCol">
                {/* 画像（9:16） */}
                <div className="posterFrame">
                  <img
                    src={w.image}
                    alt={w.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>

                {/* 思想コピー */}
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    opacity: 0.78,
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  <strong>この1枚から、映像が始まる。</strong>
                </div>

                {/* 動画（9:16・自動再生・タップで停止/再生） */}
                {videoSrc && (
                  <div style={{ marginTop: 16 }}>
                    <div className="kicker" style={{ marginBottom: 10 }}>
                      Motion
                    </div>

                    <div className="posterFrame">
                      <VideoPreview916 src={videoSrc} />
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        opacity: 0.7,
                        lineHeight: 1.6,
                        textAlign: "center",
                      }}
                    >
                      ※タップで停止／再生（音なし / ループ）
                    </div>
                  </div>
                )}
              </div>

              {/* 右：意味＋行動 */}
              <div className="rightCol">
                <div className="kicker">Product</div>

                <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 500 }}>
                  {w.title}
                </h1>

                <p className="sub" style={{ marginTop: 12 }}>
                  {w.description ??
                    "これは完成品ではありません。あなたの映像や物語が動き出す“始点”としての1フレームです。"}
                </p>

                <div
                  style={{
                    marginTop: 14,
                    fontSize: 13,
                    lineHeight: 1.9,
                    opacity: 0.88,
                  }}
                >
                  Shortの冒頭3秒。物語の導入カット。音が入る前の静止。
                  <br />
                  フェードインの最初のフレーム。
                  <br />
                  <br />
                  そういった「始まりの瞬間」に使うための素材です。
                  <br />
                  動かすのは、あなたです。
                </div>

                {/* 購入カード */}
                <div className="buyCard">
                  <div className="buyTop">
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        このフレームの使用料
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 600 }}>
                        ¥{Number((w as any).price ?? 0).toLocaleString("ja-JP")}
                      </div>
                    </div>

                    {/* CTA + お気に入り */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {w.stripePriceId ? (
  <BuyNowClient slug={w.slug} />
) : (
  <div className="btn" style={{ opacity: 0.6, pointerEvents: "none" }}>
    準備中
  </div>
)}


                      <FavoriteButton slug={w.slug} label />
                    </div>
                  </div>

                  <div style={{ marginTop: 14, fontSize: 12, opacity: 0.75, lineHeight: 1.75 }}>
                    ・解像度：1080 x 1920<br />
                    ・比率：9:16<br />
                    ・形式：PNG<br />
                    ・クレジット：無（商用利用OK）<br />
                    ・再配布・転売は禁止<br />
                  </div>

                  <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>
                    購入前に{" "}
                    <Link href="/terms" className="navLink">
                      利用規約
                    </Link>{" "}
                    と{" "}
                    <Link href="/tokushoho" className="navLink">
                      特商法
                    </Link>{" "}
                    をご確認ください。
                  </div>
                </div>

                {/* 下部ナビ：ジャンル削除 */}
                <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link className="btn" href="/works">
                    他の作品を見る
                  </Link>
                </div>
              </div>
            </div>

            {/* レイアウト用CSS（このページ内だけで完結） */}
            <style>{`
              .productGrid{
                display:grid;
                grid-template-columns: minmax(0,1fr);
                gap: 22px;
                align-items:start;
              }

              .leftCol, .rightCol{ min-width:0; }

              .posterFrame{
                width: min(420px, 100%);
                aspect-ratio: 9 / 16;
                overflow:hidden;
                border-radius:0;
                background: rgba(242,242,242,0.05);
                border: 1px solid rgba(242,242,242,0.08);
                margin-left:auto;
                margin-right:auto;
              }

              .buyCard{
                margin-top: 22px;
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 0;
                padding: 18px;
                background: rgba(0,0,0,0.10);
              }

              .buyTop{
                display:flex;
                align-items:end;
                justify-content:space-between;
                gap:12px;
                flex-wrap:wrap;
              }

              @media (min-width: 980px){
                .productGrid{
                  grid-template-columns: 420px 420px;
                  justify-content:center;
                  gap: 44px;
                }
                .posterFrame{ width: 420px; }
              }
            `}</style>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}




