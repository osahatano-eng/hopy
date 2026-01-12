import SiteFrame from "@/app/_components/SiteFrame";
import DownloadClient from "./DownloadClient";

type Props = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export default async function DownloadPage({ params }: Props) {
  const p = await params;
  const slug = p.slug;

  return (
    <SiteFrame>
      <main>
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Download</div>
            <h1 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 500 }}>
              ダウンロード準備中…
            </h1>

            {/* ★ server側で session_id を検査しない。クライアントがURLから拾う */}
            <DownloadClient slug={slug} />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
