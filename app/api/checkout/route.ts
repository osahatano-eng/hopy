import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const form = await req.formData();
  const slug = String(form.get("slug") ?? "");

  const w = WORKS.find((x) => x.slug === slug);
  if (!w) return new Response("Not found", { status: 404 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

if (!w.stripePriceId?.startsWith("price_")) {
  return new Response("この作品は準備中です", { status: 400 });
}


  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: w.stripePriceId, quantity: 1 }],
    success_url: `${origin}/checkout/success?slug=${encodeURIComponent(slug)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?slug=${encodeURIComponent(slug)}`,
  });

  return Response.redirect(session.url!, 303);
}