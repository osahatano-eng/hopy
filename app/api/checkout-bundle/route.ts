// app/api/checkout-bundle/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

// apiVersionは指定しない（型ズレ/ビルド事故を避ける）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: "missing_STRIPE_SECRET_KEY" }, { status: 500 });
  }

  let slugs: string[] = [];
  const ct = req.headers.get("content-type") || "";

  try {
    if (ct.includes("application/json")) {
      const body = await req.json();
      slugs = Array.isArray(body?.slugs) ? body.slugs.map(String) : [];
    } else {
      const form = await req.formData();
      slugs = form.getAll("slugs").map((v) => String(v));
      const one = form.get("slug");
      if (slugs.length === 0 && one) slugs = [String(one)];
    }
  } catch {
    slugs = [];
  }

  slugs = Array.from(new Set(slugs)).filter(Boolean);

  const works = WORKS.filter((w) => slugs.includes(w.slug) && Boolean(w.stripePriceId));
  if (works.length === 0) {
    return NextResponse.json({ ok: false, error: "no_sellable_items" }, { status: 400 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = works.map((w) => ({
    price: w.stripePriceId!,
    quantity: 1,
  }));

  const url = baseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/favorites`,
  });

  return NextResponse.redirect(session.url!, 303);
}
