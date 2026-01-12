import SiteFrame from "@/app/_components/SiteFrame";

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <main className="container" style={{ padding: 40 }}>
        <div className="kicker">Privacy</div>
        <h1 style={{ marginTop: 10, fontSize: 24, fontWeight: 600 }}>プライバシーポリシー</h1>

        <p style={{ marginTop: 14, opacity: 0.85, lineHeight: 1.9 }}>
          当サイトは、ユーザーの個人情報を適切に取り扱い、保護することを重要な責務と考えます。
        </p>

        <h2 style={{ marginTop: 26, fontSize: 16, fontWeight: 600 }}>1. 取得する情報</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          当サイトは、お問い合わせ時の情報（メールアドレス等）や、決済に関連する情報の一部（決済事業者から提供される範囲）を取得する場合があります。
          クレジットカード番号等は当サイトでは保持せず、決済事業者（Stripe）が取り扱います。
        </p>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>2. 利用目的</h2>
        <ul style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9, paddingLeft: 20 }}>
          <li>商品提供、決済、サポート対応</li>
          <li>お問い合わせへの回答</li>
          <li>不正利用防止、セキュリティ確保</li>
        </ul>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>3. 第三者提供</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          法令に基づく場合を除き、本人の同意なく第三者に提供しません。ただし決済処理等のため、決済事業者等に必要な範囲で情報が共有される場合があります。
        </p>

        <h2 style={{ marginTop: 22, fontSize: 16, fontWeight: 600 }}>4. お問い合わせ</h2>
        <p style={{ marginTop: 10, opacity: 0.85, lineHeight: 1.9 }}>
          本ポリシーに関するお問い合わせは、サイト内の連絡先よりご連絡ください。
        </p>

        <div style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
          最終更新日：2026-01-10（仮）
        </div>
      </main>
    </SiteFrame>
  );
}
