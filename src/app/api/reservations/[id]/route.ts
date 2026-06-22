import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { creditPlatform } from "@/lib/credit-wallet";

// PATCH actions:
//   seller: { action: "confirm" } PENDING → CONFIRMED
//   seller: { action: "reject" }  PENDING → REJECTED
//   buyer:  { action: "pay", paypalCaptureId?, bankTransferProof? } CONFIRMED → PAID
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, paypalCaptureId, bankTransferProof } = body;

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

  // Auto-expire check
  if (reservation.status === "PENDING" && reservation.expiresAt < new Date()) {
    await prisma.reservation.update({ where: { id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Reservation has expired" }, { status: 400 });
  }

  if (action === "confirm" || action === "reject") {
    // Allow ADMIN role or the listing seller
    if (reservation.sellerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the seller or admin can confirm or reject" }, { status: 403 });
    }
    if (reservation.status !== "PENDING") {
      return NextResponse.json({ error: `Cannot ${action} a ${reservation.status} reservation` }, { status: 400 });
    }
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: action === "confirm" ? "CONFIRMED" : "REJECTED" },
    });
    return NextResponse.json({ reservation: updated });
  }

  if (action === "pay") {
    if (reservation.buyerId !== session.userId) {
      return NextResponse.json({ error: "Only the buyer can pay" }, { status: 403 });
    }
    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Reservation must be confirmed before payment" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: reservation.listingId },
      select: { sellerId: true, brand: true, model: true, year: true },
    });

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paypalCaptureId: paypalCaptureId ?? null,
        bankTransferProof: bankTransferProof ?? null,
      },
    });

    // Platform collects reservation fee
    if (listing) {
      await creditPlatform(300, `Réservation — ${listing.brand} ${listing.model} ${listing.year}`);
    }

    return NextResponse.json({ reservation: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
