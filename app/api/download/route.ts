import { NextResponse } from "next/server";
import Stripe from "stripe";
import path from "path";
import fs from "fs/promises";
import { getWorkBySlug } from "@/lib/works";

export const runtime = "nodejs";

function res(status: number, msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = String(searchParams.get("session_id") ?? "").trim();
  const slug = String(searchParams.get("slug") ?? "").trim();

  if (!sessionId) return res(400, "missing_session_id");
  if (!slug) return res(400, "missing_slug");

  const work = getWorkBySlug(slug);
  if (!work) return res(404, "work_not_found");

  // ✅ ここで初めてStripeを作る（ビルド時に落ちない）
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

    const lineItems = (session as any).line_items?.data ?? [];
    const priceIds: string[] = lineItems
      .map((li: any) => li?.price?.id)
      .filter((x: any) => typeof x === "string");

    // このセッションでこのslugを買っているか
    const purchased = Boolean(work.stripePriceId && priceIds.includes(work.stripePriceId));
    if (!purchased) return res(403, "not_purchased_in_this_session");

    // private から本データを返す
    const abs = path.join(process.cwd(), "private", "works", work.downloadFile);
    const buf = await fs.readFile(abs);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/png",
        // 直リンク保存されにくくするためのダウンロード扱い
        "Content-Disposition": `attachment; filename="${work.downloadFile}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return res(400, "invalid_session");
  }
}
