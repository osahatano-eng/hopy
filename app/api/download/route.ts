import { NextResponse } from "next/server";
import Stripe from "stripe";
import path from "path";
import fs from "fs/promises";
import { getWorkBySlug } from "@/lib/works";

export const runtime = "nodejs";

function res(status: number, msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function normalizeSlugCsv(csv: unknown): string[] {
  const s = typeof csv === "string" ? csv : "";
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function contentTypeByFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

// ヘッダ用に危ない文字を落とす（日本語ファイル名でも壊れにくくする最低限）
function safeFilename(name: string) {
  return name.replace(/[\r\n"]/g, "").trim() || "download";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = String(searchParams.get("session_id") ?? "").trim();
  const slug = String(searchParams.get("slug") ?? "").trim();

  if (!sessionId) return res(400, "missing_session_id");
  if (!slug) return res(400, "missing_slug");

  const work = getWorkBySlug(slug);
  if (!work) return res(404, "work_not_found");

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res(500, "missing_STRIPE_SECRET_KEY");

  const stripe = new Stripe(key);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    // 決済完了チェック
    if ((session as any).payment_status !== "paid") {
      return res(402, "not_paid");
    }

    // ✅ 1) 最優先：metadata.slugs にこのslugが含まれているか
    const metaSlugs = normalizeSlugCsv((session as any)?.metadata?.slugs);
    let purchased = metaSlugs.includes(work.slug);

    // ✅ 2) フォールバック：line_items の priceId 照合（過去セッションなど保険）
    if (!purchased) {
      const lineItems = (session as any).line_items?.data ?? [];
      const priceIds: string[] = lineItems
        .map((li: any) => li?.price?.id ?? li?.price) // priceが文字列の可能性も拾う
        .filter((x: any) => typeof x === "string");

      purchased = Boolean(work.stripePriceId && priceIds.includes(work.stripePriceId));
    }

    if (!purchased) return res(403, "not_purchased_in_this_session");

    // private から本データを返す
    const abs = path.join(process.cwd(), "private", "works", work.downloadFile);
    const buf = await fs.readFile(abs);

    const ct = contentTypeByFilename(work.downloadFile);
    const fn = safeFilename(work.downloadFile);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": ct,
        "Content-Disposition": `attachment; filename="${fn}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return res(400, "invalid_session");
  }
}
