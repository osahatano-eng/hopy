// app/api/checkout-bundle/route.ts
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

type Body = { slugs?: string[] };

// stripePriceId を安全に扱う（WORKSの型に無くてもビルド落ちない）
function getStripePriceId(w: unknown): string | null {
  if (!w || typeof w !== "object") return null;
  const v = (w as { stripePriceId?: unknown }).stripePriceId;
  return typeof v === "string" && v.length > 0 ? v : null;
}

export async function POST(req: Request) {
  // envが無いと本番で落ちるので、ここで明示的にエラーにする
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return Response.json({ ok: false, error: "missing_stripe_secret_key" }, { status: 500 });
  }

  const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

  const { slugs } = (await req.json().catch(() => ({}))) as Body;
  const list = Array.isArray(slugs) ? slugs.filter((s) => typeof s === "string") : [];

  if (list.length === 0) {
    return Response.json({ ok: false, error: "no_items" }, { status: 400 });
  }

  const picked = list
    .map((slug) => WORKS.find((w) => w.slug === slug))
    .filter(Boolean);

  const sellable = picked
    .map((w) => ({ w, price: getStripePriceId(w) }))
    .filter((x): x is { w: (typeof WORKS)[number]; price: string } => Boolean(x.price));

  if (sellable.length === 0) {
    return Response.json({ ok: false, error: "no_sellable_items" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: sellable.map((x) => ({ price: x.price, quantity: 1 })),
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/favorites`,
  });

  return Response.json({ ok: true, url: session.url });
}

// 事故防止：ブラウザで直開きしたら405
export async function GET() {
  return Response.json(
    { ok: false, error: "method_not_allowed_use_post" },
    { status: 405 }
  );
}
