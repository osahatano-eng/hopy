import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

function jsonError(status: number, error: string, message?: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function isStripeLiveChargesBlocked(err: any) {
  const msg = typeof err?.message === "string" ? err.message : "";
  return msg.includes("cannot currently make live charges");
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return jsonError(500, "missing_STRIPE_SECRET_KEY");

  const form = await req.formData().catch(() => null);
  if (!form) return jsonError(400, "bad_request");

  const slug = String(form.get("slug") ?? "").trim();
  if (!slug) return jsonError(400, "missing_slug", "作品が指定されていません。");

  const work = WORKS.find((w) => w.slug === slug);
  if (!work) return jsonError(404, "not_found", "作品が見つかりません。");

  if (!work.stripePriceId) {
    return jsonError(400, "not_for_sale", "この作品は現在購入できません。");
  }

  const stripe = new Stripe(key);

  try {
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: work.stripePriceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/works/${encodeURIComponent(slug)}`,
      metadata: { slug },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    if (isStripeLiveChargesBlocked(err)) {
      return jsonError(
        403,
        "live_charges_blocked",
        "現在Stripe審査中のため購入できません。審査完了後に購入可能になります。"
      );
    }
    console.error(err);
    return jsonError(500, "stripe_error", "購入処理でエラーが発生しました。");
  }
}
