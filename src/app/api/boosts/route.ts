import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creditPlatform } from "@/lib/credit-wallet";

const BOOST_PLANS = {
  "7days": { price: 49, days: 7 },
  "30days": { price: 149, days: 30 },
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { listingId, plan } = await req.json();
  const planConfig = BOOST_PLANS[plan as keyof typeof BOOST_PLANS];
  if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== session.userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const expiresAt = new Date(Date.now() + planConfig.days * 86400000);

  const boost = await prisma.listingBoost.create({
    data: {
      listingId,
      sellerId: session.userId,
      plan,
      price: planConfig.price,
      status: "PAID",
      paidAt: new Date(),
      expiresAt,
    },
  });

  // Activate the listing as featured
  await prisma.listing.update({
    where: { id: listingId },
    data: { isFeatured: true, featuredUntil: expiresAt },
  });

  // Platform collects boost revenue
  await creditPlatform(planConfig.price, `Revenue boost ${plan} — annonce ${listingId.slice(0, 8)}`);

  return NextResponse.json({ boost });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");

  const boosts = await prisma.listingBoost.findMany({
    where: listingId ? { listingId, sellerId: session.userId } : { sellerId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ boosts });
}
