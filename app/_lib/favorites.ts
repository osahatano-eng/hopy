// app/_lib/favorites.ts
// Client-only: localStorage を使う（SSRでは触らない）

export const FAVORITES_KEY = "sf_favorites_v1";
export const FAVORITES_EVENT = "sf:favorites";

function safeParse(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function getFavoriteSlugs(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(FAVORITES_KEY));
}

export function isFavorite(slug: string): boolean {
  return getFavoriteSlugs().includes(slug);
}

export function setFavoriteSlugs(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(slugs)]));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function toggleFavorite(slug: string): boolean {
  const cur = getFavoriteSlugs();
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  setFavoriteSlugs(next);
  return next.includes(slug);
}

export function favoritesCount(): number {
  return getFavoriteSlugs().length;
}