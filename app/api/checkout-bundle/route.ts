import { NextResponse } from "next/server";
import Stripe from "stripe";
import { WORKS } from "@/lib/works";

export const runtime = "nodejs";

type Body = {
  slugs?: unknown;
};

function jsonError(status: number, error: string, message?: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function isStripeLiveChargesBlocked(err: any) {
  const msg =
    typeof err?.message === "string" ? err.message : "";
  return msg.includes("cannot currently make live charges");
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return jsonError(500, "missing_STRIPE_SECRET_KEY");

  // 受け取る slugs は ["abc","def"] を想定
  const body = (await req.json().catch(() => ({}))) as Body;
  const slugs = Array.isArray(body.slugs) ? body.slugs : [];

  const list = slugs.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  if (list.length === 0) return jsonError(400, "empty_slugs", "購入対象がありません。");

  // slug -> WORKS を引く（存在＆stripePriceIdがあるものだけ）
  const works = list
    .map((slug) => WORKS.find((w) => w.slug === slug))
    .filter(Boolean) as (typeof WORKS)[number][];

  const sellable = works.filter((w) => Boolean(w.stripePriceId));
  if (sellable.length === 0) {
    return jsonError(400, "no_sellable_items", "購入可能な作品がありません。");
  }

  // Stripe セッション作成
  const stripe = new Stripe(key);

  try {
    const origin = req.headers.get(" [+]

The assistant message got truncated. Need concise but include full file. We must resend complete code. Ensure not too long; but necessary. We'll provide again full file code and second file. Keep minimal.

Let's craft shorter.

