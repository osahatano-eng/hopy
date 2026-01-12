import SiteFrame from "@/app/_components/SiteFrame";
import SuccessClient from "./SuccessClient";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function SuccessPage({ searchParams }: Props) {
  const raw = searchParams?.session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;

  return (
    <SiteFrame>
      <main>
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Success</div>
            <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 500 }}>
              ご購入ありがとうございます
            </h1>

            <p className="sub" style={{ marginTop: 12 }}>
              決済が完了しました。下からダウンロードできます。
            </p>

            {/* ★ここが重要：session_id を渡す */}
            <SuccessClient sessionId={sessionId} />

            {!sessionId && (
              <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7, lineHeight: 1.7 }}>
                session_id が見つかりませんでした。Stripeの成功URLに
                <br />
                <code>?session_id=...</code> が付いているか確認してください。
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
