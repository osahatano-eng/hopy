import "server-only";

import { WORKS as GENERATED, type WorkBase } from "./works.generated";
import { WORKS_META } from "./works.meta";

export type Work = WorkBase & {
  title?: string;
  genre?: string;
  series?: string;
  price?: number;
  stripePriceId?: string;
  description?: string;
  size?: string;
  tags?: string[];
  video?: string;
};

export function getWorks(): Work[] {
  return GENERATED.map((w) => ({
    ...w,
    ...(WORKS_META[w.slug] ?? {}),
  }));
}

export function getWorkBySlug(slug: string) {
  return getWorks().find((w) => w.slug === slug);
}
