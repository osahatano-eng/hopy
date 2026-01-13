// scripts/generate-works.mjs
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PUBLIC_WORKS_DIR = path.join(ROOT, "public", "works");
const OUT_FILE = path.join(ROOT, "lib", "works.generated.ts");

function isPng(file) {
  return file.toLowerCase().endsWith(".png");
}

function slugFromFilename(file) {
  // 拡張子は大小無視で除去するので、.png と .PNG は同じslugになる
  return file.replace(/\.png$/i, "");
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
  if (!fs.existsSync(PUBLIC_WORKS_DIR)) {
    throw new Error(`public/works not found: ${PUBLIC_WORKS_DIR}`);
  }

  const files = fs
    .readdirSync(PUBLIC_WORKS_DIR)
    .filter(isPng)
    .sort((a, b) => a.localeCompare(b));

  // slugの重複を検知（例: y8durmct.png と y8durmct.PNG）
  const bySlug = new Map();
  for (const file of files) {
    const slug = slugFromFilename(file);
    const list = bySlug.get(slug) ?? [];
    list.push(file);
    bySlug.set(slug, list);
  }

  const duplicates = [...bySlug.entries()].filter(([, list]) => list.length > 1);
  if (duplicates.length) {
    const msg = duplicates
      .map(([slug, list]) => `- slug "${slug}" : ${list.join(", ")}`)
      .join("\n");
    throw new Error(
      `Duplicate slugs detected in public/works. Rename/remove duplicates:\n${msg}\n` +
        `Tip: ".png" and ".PNG" become the same slug.`
    );
  }

  const works = files.map((file) => {
    const slug = slugFromFilename(file);
    return {
      slug,
      image: `/works/${file}`, // public表示用
      downloadFile: file, // private側の同名ファイル
    };
  });

  const header = `/* AUTO-GENERATED FILE. DO NOT EDIT.
 * Generated from /public/works by scripts/generate-works.mjs
 */`;

  const body = `${header}
export type WorkBase = {
  slug: string;
  image: string;
  downloadFile: string;
};

export const WORKS: WorkBase[] = ${JSON.stringify(works, null, 2)} as const;
`;

  ensureDirExists(path.dirname(OUT_FILE));
  fs.writeFileSync(OUT_FILE, body, "utf8");

  console.log(
    `Generated: ${path.relative(ROOT, OUT_FILE)} (${works.length} works)`
  );
}

main();
