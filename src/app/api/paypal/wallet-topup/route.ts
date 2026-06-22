import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

// POST /api/paypal/wallet-topup
// body: { action: "create", amount } | { action: "capture", orderID }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const token = await getAccessToken();

  if (body.action === "create") {
    const { amount } = body;
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Montant minimum : 50 MAD" }, { status: 400 });
    }

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "USD", value: (amount / 10).toFixed(2) },
            description: `Recharge Sou9Car Wallet — ${amount} MAD`,
          },
        ],
      }),
    });
    const order = await res.json();
    if (!res.ok) return NextResponse.json({ error: order.message ?? "PayPal error" }, { status: 500 });
    return NextResponse.json({ id: order.id });
  }

  if (body.action === "capture") {
    const { orderID, amount } = body;
    if (!orderID) return NextResponse.json({ error: "Missing orderID" }, { status: 400 });

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const capture = await res.json();
    if (!res.ok) return NextResponse.json({ error: capture.message ?? "Capture failed" }, { status: 500 });

    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Credit the wallet
    let wallet = await prisma.wallet.findUnique({ where: { userId: session.userId } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: session.userId } });
    }

    await prisma.$transaction([
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: "TOPUP_PAYPAL",
          status: "CONFIRMED",
          reference: orderID,
          note: `Recharge PayPal — ${amount} MAD`,
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      }),
    ]);

    return NextResponse.json({ success: true, credited: amount });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
