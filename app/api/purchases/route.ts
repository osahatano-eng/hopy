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

function normalizeSlugCsv(csv: unknown): string[] {
  const s = typeof csv === "string" ? csv : "";
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
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

  const stripe = new Stripe(key);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    if ((session as any).payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "not_paid" }, { status: 402 });
    }

    // ✅ 1) 最優先：metadata.slugs から復元（checkout-bundleで入れてるので最も確実）
    const metaSlugs = normalizeSlugCsv((session as any)?.metadata?.slugs);
    let boughtWorks: (typeof WORKS)[number][] = [];

    if (metaSlugs.length > 0) {
      // metadata順でWORKSを引く（順番を維持）
      boughtWorks = metaSlugs
        .map((slug) => WORKS.find((w) => w.slug === slug))
        .filter(Boolean) as (typeof WORKS)[number][];
    } else {
      // ✅ 2) フォールバック：line_items の priceId から復元（保険）
      const lineItems = (session as any).line_items?.data ?? [];
      const priceIds: string[] = lineItems
        .map((li: any) => li?.price?.id ?? li?.price) // priceが文字列のケースも拾う
        .filter((x: any) => typeof x === "string");

      boughtWorks = WORKS.filter(
        (w) => typeof w.stripePriceId === "string" && priceIds.includes(w.stripePriceId)
      );
    }

    return NextResponse.json({
      ok: true,
      session_id: sessionId,
      count: boughtWorks.length,
      items: boughtWorks.map((w) => ({
        slug: w.slug,
        image: (w as any).image,
        title: (w as any).title ?? w.slug,
        // （今はSuccessClientは /download/[slug]?session_id=... に誘導してるので必須ではない）
        download: `${baseUrl()}/api/download?session_id=${encodeURIComponent(sessionId)}&slug=${encodeURIComponent(
          w.slug
        )}`,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 400 });
  }
}
