import SiteFrame from "@/app/_components/SiteFrame";
import Link from "next/link";

export default function ContactPage() {
  return (
    <SiteFrame>
      <main className="container" style={{ padding: 40 }}>
        <div className="kicker">Contact</div>
        <h1 style={{ marginTop: 10, fontSize: 24, fontWeight: 600 }}>お問い合わせ</h1>

        <p style={{ marginTop: 14, opacity: 0.85, lineHeight: 1.9 }}>
          メールでご連絡ください。
        </p>

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn btnPrimary" href="mailto:hatano@hopy.co.jp">メールで連絡</a>
          <Link className="btn" href="/works">作品を見る</Link>
        </div>
      </main>
    </SiteFrame>
  );
}
