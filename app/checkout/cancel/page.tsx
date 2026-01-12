import Link from "next/link";

export default function Page({ searchParams }: { searchParams: { slug?: string } }) {
  const slug = searchParams.slug ?? "";
  return (
    <main className="container" style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>キャンセルされました</h1>
      <p style={{ marginTop: 12, opacity: 0.8 }}>決済は完了していません。</p>
      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link className="btn" href="/works">作品一覧へ</Link>
        {slug ? <Link className="btn btnPrimary" href={`/p/${slug}`}>商品ページへ戻る</Link> : null}
      </div>
    </main>
  );
}