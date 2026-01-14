import SiteFrame from "@/app/_components/SiteFrame";

export default function TokushohoPage() {
  return (
    <SiteFrame>
      <main className="container" style={{ padding: 40 }}>
        <div className="kicker">Legal</div>
        <h1 style={{ marginTop: 10, fontSize: 24, fontWeight: 600 }}>特定商取引法に基づく表記</h1>

        <div style={{ marginTop: 18, lineHeight: 2.0, opacity: 0.9 }}>
          <div><b>販売事業者</b>：ホピー株式会社</div>
          <div><b>運営責任者</b>：波多野　修</div>
          <div><b>所在地</b>：東京都練馬区谷原５-９-１３</div>
          <div><b>連絡先</b>：hatano@hopy.co.jp</div>
          <div><b>販売価格</b>：各商品ページに表示（消費税込）</div>
          <div><b>商品代金以外の必要料金</b>：通信料等はお客様負担</div>
          <div><b>お支払い方法</b>：Link/Apple Pay/Google Pay/PayPay（Stripe）</div>
          <div><b>お支払い時期</b>：購入時に即時決済</div>
          <div><b>引き渡し時期</b>：決済完了後、ダウンロードにより即時</div>
          <div><b>返品・キャンセル</b>：デジタル商品の性質上、原則不可</div>
          <div><b>動作環境</b>：一般的なブラウザ / インターネット接続（推奨：最新版）</div>
        </div>

        <div style={{ marginTop: 18, opacity: 0.6, fontSize: 12 }}>
          最終更新日：2026-01-13
        </div>
      </main>
    </SiteFrame>
  );
}


