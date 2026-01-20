import SiteFrame from "@/app/_components/SiteFrame";
import HomeShelvesClient from "@/app/_components/HomeShelvesClient";
import { getWorks } from "@/lib/works.server";

export default function HomePage() {
  const works = getWorks();

  // client に渡すのは最小限（安全＆軽量）
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
        {/* Hero（残す：AI VISUAL STUDIO / Silent Start） */}
        <section className="hero heroMinimal">
          <div className="container">
            <div className="kicker">AI VISUAL STUDIO</div>
            <h1 className="h1">Silent Start</h1>
          </div>
        </section>

        {/* Netflix棚 */}
        <section className="section" style={{ paddingTop: 18 }}>
          <div className="container">
            <HomeShelvesClient works={data} />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
