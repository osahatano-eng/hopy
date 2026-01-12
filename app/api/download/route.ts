import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import Stripe from "stripe";
import { getWorkBySlug } from "@/lib/works";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


function res(status: number, message: string) {
  return new NextResponse(message, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = String(searchParams.get("slug") ?? "").trim();
    const sessionId = String(searchParams.get("session_id") ?? "").trim();

    if (!slug || !sessionId) return res(400, "Missing slug or session_id");

    const work = getWorkBySlug(slug);
    if (!work) return res(400, "Unknown work");
    if (!work.stripePriceId) return res(403, "Not for sale");

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });

    if (!session || (session as any).payment_status !== "paid") {
      return res(403, "Payment not completed");
    }

    const lineItems = (session as any).line_items?.data ?? [];
    const purchased = lineItems.some((li: any) => li?.price?.id === work.stripePriceId);
    if (!purchased) return res(403, "Not purchased in this session");

    const abs = path.join(process.cwd(), "private", "works", work.downloadFile);
    const buf = await fs.readFile(abs);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${work.downloadFile}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return res(500, "Server Error");
  }
}

