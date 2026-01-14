// app/api/checkout-bundle/route.ts
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

type Body = { slugs?: string[] };

export async function POST(req: Request) {
  const { slugs } = (await req.json().catch(() => ({}))) as Body;

  const list = Array.isArray(slugs) ? slugs.filter((s) => typeof s === "string") : [];
  if (list.length === 0) {
    return Response.json({ ok: false, error: "no_items" }, { status: 400 });
  }

  // slugs -> works
  const items = list
    .map((slug) => WORKS.find((w) => w.slug === slug))
    .filter(Boolean) as any[];

  const sellable = items.filter((w) => Boolean(w.stripePriceId));
  if (sellable.length === 0) {
    return Response.json({ ok: false, error: "no_sellable_items" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: sellable.map((w) => ({
      price: w.stripePriceId,
      quantity: 1,
    })),
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/favorites`,
  });

  return Response.json({ ok: true, url: session.url });
}

// ブラウザで /api/checkout-bundle を直接開いた時に買えないようにする（今回の事故防止）
export async function GET() {
  return Response.json(
    { ok: false, error: "method_not_allowed_use_post" },
    { status: 405 }
  );
}
