import { NextRequest, NextResponse } from "next/server";

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();
    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const capture = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: capture.message ?? "Capture failed" }, { status: 500 });
    }

    const status = capture.status;
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    return NextResponse.json({ status, captureId, order: capture });
  } catch (err) {
    console.error("PayPal capture-order error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
