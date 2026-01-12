import SiteFrame from "@/app/_components/SiteFrame";
import SuccessClient from "./SuccessClient";

type Props = {
  searchParams?: { session_id?: string } | Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const sessionId = String(sp.session_id ?? "");

  return (
    <SiteFrame>
      <main>
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Success</div>
            <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 500 }}>
              購入が完了しました
            </h1>

            <p className="sub" style={{ marginTop: 12 }}>
              ありがとうございました。決済が完了しました。
              <br />
              次は、ダウンロード導線をここに足して「購入→即入手」を完成させます。
            </p>

            <SuccessClient sessionId={sessionId} />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
