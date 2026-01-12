// src/lib/works.ts

export type Work = {
  slug: string;
  title: string;
  priceJPY: number;

  // プレビュー（public配信）
  image: string; // 例: "/works/nocturne-quiet-road.jpg"

  // 売り物（private保管）
  downloadFile: string; // 例: "nocturne-quiet-road.png"

  // Stripe
  stripePriceId?: string; // 販売中だけ入れる
};

export const WORKS: Work[] = [
  {
    slug: "nocturne-quiet-road",
    title: "Nocturne Quiet Road",
    priceJPY: 1500,
    image: "/works/nocturne-quiet-road.jpg",
    downloadFile: "nocturne-quiet-road.png",
    stripePriceId: "price_xxxxxxxxxxxxx", // ←あなたのID
  },
  // ここに追加していく
];

export function getWorkBySlug(slug: string) {
  return WORKS.find((w) => w.slug === slug);
}
