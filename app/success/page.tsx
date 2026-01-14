import SiteFrame from "@/app/_components/SiteFrame";
import SuccessClient from "./SuccessClient";

type SP = { [key: string]: string | string[] | undefined };

type Props = {
  searchParams?: Promise<SP> | SP;
};

export default async function SuccessPage({ searchParams }: Props) {
  const sp: SP =
    typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<SP>)
      : (searchParams as SP) ?? {};

  const raw = sp.session_id;
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
              決済が完了しました。下からダウンロードできます。<br />
              1080x1920ピクセル /　クレジットなし
            </p>

            {/* ★ここが重要：session_id を渡す */}
            <SuccessClient sessionId={sessionId} />

            {!sessionId && (
              <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7, lineHeight: 1.7 }}>
                session_id が見つかりませんでした。
                <br />
                ただしこれは Next.js 側で searchParams を正しく読めていない可能性が高いです。
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

