import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = String(searchParams.get("session_id") ?? "").trim();

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing_session_id" }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "missing_STRIPE_SECRET_KEY" }, { status: 500 });
  }

  // ✅ ビルド時に落ちない
  const stripe = new Stripe(key);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    if ((session as any).payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "not_paid" }, { status: 402 });
    }

    const lineItems = (session as any).line_items?.data ?? [];
    const priceIds: string[] = lineItems
      .map((li: any) => li?.price?.id)
      .filter((x: any) => typeof x === "string");

    const bought = WORKS.filter((w) => w.stripePriceId && priceIds.includes(w.stripePriceId));

    return NextResponse.json({
      ok: true,
      session_id: sessionId,
      count: bought.length,
      items: bought.map((w) => ({
        slug: w.slug,
        image: w.image,
        title: (w as any).title ?? w.slug,
        // SuccessClientは /download/[slug]?session_id=... に誘導するので、ここでは不要でもOK
        download: `${baseUrl()}/api/download?session_id=${encodeURIComponent(sessionId)}&slug=${encodeURIComponent(w.slug)}`,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });
  }
}
