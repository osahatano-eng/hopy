import SiteFrame from "@/app/_components/SiteFrame";
import WorksClient from "./WorksClient";
import { getWorks } from "@/lib/works.server";

export default function WorksPage() {
  const works = getWorks();

  // クライアントに渡す最小データだけにする（安全＆軽い）
  const data = works.map((w) => ({
    slug: w.slug,
    image: w.image,
    series: w.series ?? "",
    stripePriceId: w.stripePriceId ?? "",
    price: w.price ?? 0,
  }));

  return (
    <SiteFrame>
      <main>
        <section className="section">
          <div className="container">
            <div className="kicker">WORKS</div>
            <h1 className="h1">フレームを選ぶ</h1>

            <WorksClient works={data} />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
