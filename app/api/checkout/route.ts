import { NextResponse } from "next/server";
import Stripe from "stripe";

// いまは WORKS を使っているけど、タイヤに切り替えるなら
// 同じ仕組みで TIRES を作るのが一番安全。
// ここでは例として WORKS を使わず、stripePriceId を form で受け取る形にしてあります。
// （最終的には DB or TIRES 定義へ寄せるのがおすすめ）
export const runtime = "nodejs";

function jsonError(status: number, error: string, message?: string) {
  return NextResponse.json({ ok: false, error, message }, { status });
}

function isStripeLiveChargesBlocked(err: any) {
  const msg = typeof err?.message === "string" ? err.message : "";
  return msg.includes("cannot currently make live charges");
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return jsonError(500, "missing_STRIPE_SECRET_KEY");

  const form = await req.formData().catch(() => null);
  if (!form) return jsonError(400, "bad_request");

  // ★タイヤ販売用：商品は slug ではなく priceId / sku 等で扱うのが現実的
  // 今回は最小構成として priceId を受け取る
  const priceId = String(form.get("priceId") ?? "").trim();
  if (!priceId) return jsonError(400, "missing_priceId", "商品が指定されていません。");

  // 本数（数量）
  const qtyRaw = Number(form.get("quantity") ?? 1);
  const quantity = clampInt(qtyRaw, 1, 8); // タイヤは上限を適当に制限（必要に応じて）

  // 画面表示用（任意）
  const sku = String(form.get("sku") ?? "").trim(); // 例: "BRIDGESTONE-REGNO-195-65R15"
  const size = String(form.get("size") ?? "").trim(); // 例: "195/65R15"

  const stripe = new Stripe(key);

  try {
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    // ★送料（例：全国一律 1,200円）
    // 後で「地域別」「本数別」にするならここをロジック化する
    const shippingRateData: Stripe.Checkout.SessionCreateParams.ShippingOption.ShippingRateData =
      {
        type: "fixed_amount",
        fixed_amount: {
          amount: 1200, // JPY: 1200円
          currency: "jpy",
        },
        display_name: "送料（全国一律）",
        // delivery_estimate は任意
        delivery_estimate: {
          minimum: { unit: "business_day", value: 2 },
          maximum: { unit: "business_day", value: 7 },
        },
      };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      // ★物理商品の基本：住所/電話
      shipping_address_collection: {
        allowed_countries: ["JP"],
      },
      phone_number_collection: {
        enabled: true,
      },

      // 請求先住所も必要なら required（任意）
      // billing_address_collection: "required",

      // ★送料（Shipping options）
      shipping_options: [
        {
          shipping_rate_data: shippingRateData,
        },
      ],

      // ★商品（タイヤ）
      line_items: [{ price: priceId, quantity }],

      // ★成功/キャンセル遷移
      // success は注文完了ページへ（download はもう不要）
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,

      // ★Webhookで注文を作るための最低限の情報
      metadata: {
        kind: "tire",
        priceId,
        quantity: String(quantity),
        sku: sku || "",
        size: size || "",
      },

      // 任意：割引コードを使いたいなら
      // allow_promotion_codes: true,

      // 任意：税計算を使う場合（導入してないならコメントのままでOK）
      // automatic_tax: { enabled: true },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    if (isStripeLiveChargesBlocked(err)) {
      return jsonError(
        403,
        "live_charges_blocked",
        "現在Stripe審査中のため購入できません。審査完了後に購入可能になります。"
      );
    }
    console.error(err);
    return jsonError(500, "stripe_error", "購入処理でエラーが発生しました。");
  }
}
