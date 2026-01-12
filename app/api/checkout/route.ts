import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getWorkBySlug } from "@/lib/works";

export const runtime = "nodejs";

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "missing_STRIPE_SECRET_KEY" }, { status: 500 });
  }

  const stripe = new Stripe(key);

  const form = await req.formData();
  const slug = String(form.get("slug") ?? "").trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "missing_slug" }, { status: 400 });
  }

  const work = getWorkBySlug(slug);
  if (!work || !work.stripePriceId) {
    return NextResponse.json({ ok: false, error: "not_sellable" }, { status: 404 });
  }

  const url = baseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: work.stripePriceId, quantity: 1 }],
    success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/p/${encodeURIComponent(slug)}`,
  });

  return NextResponse.redirect(session.url!, 303);
}
