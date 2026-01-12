import SiteFrame from "@/app/_components/SiteFrame";
import Link from "next/link";

export default function LicensePage() {
  return (
    <SiteFrame>
      <main className="container" style={{ padding: 40 }}>
        <div className="kicker">License</div>
        <h1 style={{ marginTop: 10, fontSize: 24, fontWeight: 600 }}>ライセンス</h1>

        <p style={{ marginTop: 14, opacity: 0.85, lineHeight: 1.9 }}>
          このページは準備中です。
          <br />
          当面は「再配布・転売は禁止 / 商用利用OK」を基本方針とします。
        </p>

        <div style={{ marginTop: 18, opacity: 0.85, lineHeight: 1.9 }}>
          <div>・購入したデータの再配布、共有、転売は禁止</div>
          <div>・商用利用はOK（用途の不安は購入前に相談）</div>
          <div>・購入後のダウンロード画像には透かしやクレジットは入りません</div>
        </div>

        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btnPrimary" href="/works">作品を見る</Link>
          <Link className="btn" href="/contact">問い合わせる</Link>
        </div>
      </main>
    </SiteFrame>
  );
}
