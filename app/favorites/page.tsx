import SiteFrame from "@/app/_components/SiteFrame";
import FavoritesClient from "./FavoritesClient";

export default function FavoritesPage() {
  return (
    <SiteFrame>
      <main>
        <section className="section" style={{ paddingTop: 44 }}>
          <div className="container">
            <div className="kicker">Favorites</div>
            <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 500 }}>
              保存したフレーム
            </h1>

            <FavoritesClient />
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
