import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = String(searchParams.get("session_id") ?? "").trim();

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing_session_id" }, { status: 400 });
  }

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
        image: w.image, // public/works の軽量PNG（540×960）
        title: w.title ?? w.slug,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });
  }
}
