import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const WORKS_DIR = path.join(ROOT, "public", "works");
const OUT_FILE = path.join(ROOT, "lib", "works.generated.ts");

const IMG_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

function assertSafeSlug(slug) {
  if (!/^[a-z0-9][a-z0-9-_]*$/.test(slug)) {
    throw new Error(
      "[generate-works] Unsafe slug: \"" +
        slug +
        "\"\nファイル名は英小文字/数字/ - _ のみ推奨。\n例: nocturne-quiet-road.png"
    );
  }
}

function main() {
  if (!fs.existsSync(WORKS_DIR)) {
    throw new Error("[generate-works] Not found: " + WORKS_DIR);
  }

  const files = fs
    .readdirSync(WORKS_DIR, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => IMG_EXTS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "en"));

  const items = files.map((name) => {
    const ext = path.extname(name);
    const base = path.basename(name, ext);
    const slug = base.trim().toLowerCase();
    assertSafeSlug(slug);
    return { slug: slug, image: "/works/" + name };
  });

  const content =
    "/* AUTO-GENERATED FILE. DO NOT EDIT.\n" +
    " * Generated from /public/works by scripts/generate-works.mjs\n" +
    " */\n" +
    "export type WorkBase = {\n" +
    "  slug: string;\n" +
    "  image: string;\n" +
    "};\n\n" +
    "export const WORKS: WorkBase[] = " +
    JSON.stringify(items, null, 2) +
    " as const;\n";

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, content, "utf8");

  console.log(
    "[generate-works] " +
      items.length +
      " works -> " +
      path.relative(ROOT, OUT_FILE)
  );
}

main();
