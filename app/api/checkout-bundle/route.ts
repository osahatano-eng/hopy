import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return url;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const slugsRaw = String(form.get("slugs") ?? "");

  const slugs = slugsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) {
    return NextResponse.redirect(new URL("/favorites", getBaseUrl()), { status: 303 });
  }

  // サーバー側で照合（改ざん防止）
  const works = slugs
    .map((slug) => WORKS.find((w) => w.slug === slug))
    .filter(Boolean) as (typeof WORKS)[number][];

  if (works.length === 0) {
    return new NextResponse("No valid items.", { status: 400 });
  }

  // 重複排除
  const uniq = Array.from(new Map(works.map((w) => [w.slug, w])).values());

  // stripePriceId が無いものが混ざったら弾く（あなたの運用だと基本ないはず）
  if (uniq.some((w) => !w.stripePriceId)) {
    return new NextResponse("Some items are not purchasable.", { status: 400 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = uniq.map((w) => ({
    price: w.stripePriceId!,
    quantity: 1,
  }));

  const baseUrl = getBaseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/favorites`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
