import SiteFrame from "@/app/_components/SiteFrame";

export default function TermsPage() {
  return (
    <SiteFrame>
      <main className="container" style={{ padding: 40 }}>
        <div className="kicker">Terms</div>
        <h1 style={{ marginTop: 10, fontSize: 24, fontWeight: 600 }}>利用規約</h1>

        <p style={{ marginTop: 14, opacity: 0.85, lineHeight: 1.9 }}>
          本規約は、ホピー株式会社（以下「当サイト」）が提供するデジタルコンテンツ（画像データ等）の販売・提供に関する条件を定めるものです。
          ご購入前に必ずお読みください。
        </p>

        <h2 style={{ marginTop: 26, fontSize: 16, fontWeight: 600 }}>第1条（提供内容）</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          当サイトは、デジタルコンテンツ（画像データ等）をオンラインで提供します。納品はダウンロードにより行います。
        </p>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>第2条（購入・支払い）</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          お支払いは決済サービス（Stripe）を通じて行います。購入手続き完了後、ダウンロードページが表示されます。
        </p>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>第3条（返品・キャンセル）</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          デジタル商品の性質上、原則として購入後の返品・返金・交換はできません。ただし、当サイトの不具合等によりダウンロードが著しく困難な場合は、合理的な範囲で対応します。
        </p>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>第4条（禁止事項）</h2>
        <ul style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9, paddingLeft: 20 }}>
          <li>購入したデータの再配布、転売、共有（無料/有料を問わず）</li>
          <li>当サイトや第三者の権利を侵害する行為</li>
          <li>法令または公序良俗に反する利用</li>
        </ul>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>第5条（免責）</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          当サイトは、利用者の環境に起因する損害、または当サイトの提供中断・停止等による損害について、当サイトに故意または重過失がある場合を除き責任を負いません。
        </p>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>第6条（規約の変更）</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          当サイトは、必要に応じて本規約を改定することがあります。改定後の内容は当サイト上での掲示をもって効力を生じます。
        </p>

        <div style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
          最終更新日：2026-01-13
        </div>
      </main>
    </SiteFrame>
  );
}

