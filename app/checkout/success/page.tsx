import Link from "next/link";

type SearchParams = { slug?: string; session_id?: string };
type Props = { searchParams: SearchParams | Promise<SearchParams> };

export default async function SuccessPage({ searchParams }: Props) {
  const sp = await searchParams; // ★ここがポイント（Promiseをunwrap）
  const slug = sp.slug ?? "";

  return (
    <main className="container" style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>購入ありがとうございます</h1>

      <p style={{ marginTop: 12, opacity: 0.8 }}>決済が完了しました。ダウンロードは下のボタンから行えます。</p>

      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {slug ? (
          <Link className="btn btnPrimary" href={`/download/${slug}`}>
            ダウンロードへ
          </Link>
        ) : null}

        <Link className="btn" href="/works">
          作品一覧へ
        </Link>
      </div>
    </main>
  );
}
