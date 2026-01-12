/* AUTO-GENERATED FILE. DO NOT EDIT.
 * Generated from /public/works by scripts/generate-works.mjs
 */
export type WorkBase = {
  slug: string;
  image: string;        // public/works の軽量PNG
  downloadFile: string; // private/works の高解像度PNG（ファイル名）
};

export const WORKS: WorkBase[] = [
  { slug: "y8durmct", image: "/works/y8durmct.png", downloadFile: "y8durmct.png" },
] as const;
