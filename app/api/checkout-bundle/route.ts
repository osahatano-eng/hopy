import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

type Body = {
  slugs?: unknown;
};

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

  const body = (await req.json().catch(() => ({}))) as Body;
  const slugs = Array.isArray(body.slugs) ? body.slugs : [];

  const list = slugs.filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0
  );
  if (list.length === 0) return jsonError(400, "empty_slugs", "購入対象がありません。");

  const works = list
    .map((slug) => WORKS.find((w) => w.slug === slug))
    .filter(Boolean) as (typeof WORKS)[number][];

  const sellable = works.filter((w) => typeof w.stripePriceId === "string" && w.stripePriceId.length > 0);
  if (sellable.length === 0) {
    return jsonError(400, "no_sellable_items", "購入可能な作品がありません。");
  }

  const stripe = new Stripe(key);

  try {
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: sellable.map((w) => ({
        price: w.stripePriceId as string,
        quantity: 1,
      })),
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/favorites`,
      metadata: {
        slugs: sellable.map((w) => w.slug).join(","),
      },
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
