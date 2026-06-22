import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendReservationRequestEmail } from "@/lib/email";

const RESERVATION_FEE = 300;
const EXPIRY_HOURS = 2;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { listingId } = await req.json();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.sellerId === session.userId) {
    return NextResponse.json({ error: "Cannot reserve your own listing" }, { status: 400 });
  }
  if (listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing is not available" }, { status: 400 });
  }

  // Block duplicate active requests
  const existing = await prisma.reservation.findFirst({
    where: {
      listingId,
      buyerId: session.userId,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have an active reservation for this listing", reservation: existing }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  const [reservation, buyer] = await Promise.all([
    prisma.reservation.create({
      data: {
        listingId,
        buyerId: session.userId,
        sellerId: listing.sellerId,
        status: "PENDING",
        expiresAt,
      },
      include: {
        listing: { select: { brand: true, model: true, year: true, city: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true },
    }),
  ]);

  // Notify admin (Youssef) by email
  const fullListing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { brand: true, model: true, year: true, city: true },
  });
  if (buyer && fullListing) {
    sendReservationRequestEmail({
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerEmail: buyer.email,
      listingTitle: `${fullListing.brand} ${fullListing.model} ${fullListing.year}`,
      listingCity: fullListing.city,
      reservationId: reservation.id,
      expiresAt,
    }).catch(() => {});
  }

  return NextResponse.json({ reservation, fee: RESERVATION_FEE }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") ?? "buyer";
  const listingId = searchParams.get("listingId");

  // Auto-expire stale reservations
  await prisma.reservation.updateMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  const where =
    role === "seller"
      ? { sellerId: session.userId, ...(listingId ? { listingId } : {}) }
      : { buyerId: session.userId, ...(listingId ? { listingId } : {}) };

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true, city: true, price: true } },
      buyer: { select: { id: true, name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reservations, fee: RESERVATION_FEE });
}
