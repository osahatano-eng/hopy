import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

type Body = { slugs?: string[] };

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return Response.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
  }

  // ✅ apiVersion を指定しない（型エラー回避）
  const stripe = new Stripe(key);

  const { slugs } = (await req.json().catch(() => ({}))) as Body;
  const list = Array.isArray(slugs) ? slugs.filter((s) => typeof s === "string") : [];

  if (list.length === 0) {
    return Response.json({ ok: false, error: "no_items" }, { status: 400 });
  }

  const picked = list.map((slug) => WORKS.find((w) => w.slug === slug)).filter(Boolean);

  const sellable = picked
    .map((w) => (typeof (w as any).stripePriceId === "string" ? (w as any).stripePriceId : null))
    .filter((p): p is string => Boolean(p));

  if (sellable.length === 0) {
    return Response.json({ ok: false, error: "no_sellable_items" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: sellable.map((price) => ({ price, quantity: 1 })),
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/favorites`,
  });

  return Response.json({ ok: true, url: session.url });
}

export async function GET() {
  return Response.json({ ok: false, error: "use_post" }, { status: 405 });
}
