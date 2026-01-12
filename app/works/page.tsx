import SiteFrame from "@/app/_components/SiteFrame";
import WorksClient from "./WorksClient";

export default function WorksPage() {
  return (
    <SiteFrame>
      <main>
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Works</div>
            <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 500 }}>
              フレームを選ぶ
            </h1>

            <WorksClient />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
