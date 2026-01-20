import { WORKS as GENERATED, type WorkBase } from "./works.generated";
import { WORKS_META } from "./works.meta";

export type Work = WorkBase & {
  // title/genreは “無しでいい” ので optional
  title?: string;
  genre?: string;

  // ★追加：シリーズ（Netflix行のキー用）
  series?: string;

  // 既存のメタ（売る情報）
  price?: number;
  stripePriceId?: string;
  description?: string;
  size?: string;
  tags?: string[];
  video?: string;
};

export const WORKS: Work[] = GENERATED.map((w) => ({
  ...w,
  ...(WORKS_META[w.slug] ?? {}),
}));

export function getWorkBySlug(slug: string) {
  return WORKS.find((w) => w.slug === slug);
}
