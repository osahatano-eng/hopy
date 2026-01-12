import SiteFrame from "@/app/_components/SiteFrame";
import { getWorkBySlug } from "@/lib/works";

type Props = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function DownloadPage({ params, searchParams = {} }: Props) {
  const slug = params.slug;

  const sessionIdRaw = searchParams.session_id;
  const session_id = Array.isArray(sessionIdRaw) ? sessionIdRaw[0] : sessionIdRaw;

  if (!session_id) {
    return (
      <SiteFrame>
        <main className="container" style={{ padding: "24px 0" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Forbidden</h1>
          <p style={{ marginTop: 10 }}>session_id がありません。</p>
        </main>
      </SiteFrame>
    );
  }

  const work = getWorkBySlug(slug);
  if (!work) {
    return (
      <SiteFrame>
        <main className="container" style={{ padding: "24px 0" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Not Found</h1>
          <p style={{ marginTop: 10 }}>作品が見つかりません。</p>
        </main>
      </SiteFrame>
    );
  }

  const href = `/api/download?slug=${encodeURIComponent(slug)}&session_id=${encodeURIComponent(
    session_id
  )}`;

  return (
    <SiteFrame>
      <main className="container" style={{ padding: "24px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Download</h1>
        <p style={{ marginTop: 10 }}>{work.title ?? work.slug}</p>

        <div style={{ marginTop: 16 }}>
          <a
            href={href}
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 10,
              background: "black",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            原本（高解像度PNG）をダウンロード
          </a>
        </div>

        <p style={{ marginTop: 16, opacity: 0.7 }}>
          ※ 購入確認（paid + 購入品一致）を通った場合のみダウンロードできます。
        </p>
      </main>
    </SiteFrame>
  );
}
