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
        {/* Hero */}
        <section className="hero heroMinimal">
          <div className="container">
            <div className="kicker">HOPY AI — Visual Studio for Hope</div>

            <h1 className="h1">
              Your Past. <br />Your Future.<br /> In One Frame.
            </h1>

            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                lineHeight: 1.6,
                letterSpacing: "0.06em",
                opacity: 0.8,
                maxWidth: 520,
              }}
            >
              過去の私と、未来の私を、一枚に。
              <br />
              これは懐かしさじゃない。
              <br />
              <strong>これは、希望だ。</strong>
            </p>
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
