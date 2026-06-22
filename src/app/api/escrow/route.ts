import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creditPlatform } from "@/lib/credit-wallet";

// Platform fee: 4% for escrow transactions, 5% for off-platform deals.
const FEE_RATE = 0.04;

function computeEscrowFee(price: number) {
  return Math.round(price * FEE_RATE);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { listingId } = await req.json();

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId === session.userId) {
    return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });
  }

  const existing = await prisma.escrowTransaction.findFirst({
    where: { listingId, buyerId: session.userId, status: { in: ["PENDING", "FUNDED"] } },
  });
  if (existing) return NextResponse.json({ error: "Escrow already open for this listing" }, { status: 400 });

  const fee = computeEscrowFee(listing.price);

  const escrow = await prisma.escrowTransaction.create({
    data: {
      listingId,
      buyerId: session.userId,
      amount: listing.price,
      fee,
      status: "PENDING",
    },
  });

  return NextResponse.json({ escrow }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const escrows = await prisma.escrowTransaction.findMany({
    where: { buyerId: session.userId },
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true, price: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ escrows });
}

// PATCH — buyer actions on their own escrow:
//   { id, action: "fund" }    PENDING → FUNDED   (buyer has paid; Sou9Car holds the money)
//   { id, action: "release" } FUNDED  → RELEASED (buyer approves the car; seller gets paid)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id, action } = await req.json();
  const escrow = await prisma.escrowTransaction.findUnique({ where: { id } });
  if (!escrow || escrow.buyerId !== session.userId) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  let newStatus: "FUNDED" | "RELEASED" | null = null;
  if (action === "fund" && escrow.status === "PENDING") newStatus = "FUNDED";
  if (action === "release" && escrow.status === "FUNDED") newStatus = "RELEASED";
  if (!newStatus) {
    return NextResponse.json({ error: `Cannot ${action} a ${escrow.status} escrow` }, { status: 400 });
  }

  const updated = await prisma.escrowTransaction.update({
    where: { id },
    data: { status: newStatus, ...(newStatus === "RELEASED" ? { releasedAt: new Date() } : {}) },
    include: { listing: { select: { sellerId: true, brand: true, model: true, year: true } } },
  });

  // Platform collects full escrow amount on release
  if (newStatus === "RELEASED") {
    await creditPlatform(
      escrow.amount,
      `Escrow libéré — ${updated.listing.brand} ${updated.listing.model} ${updated.listing.year}`
    );
  }

  return NextResponse.json({ escrow: updated });
}
