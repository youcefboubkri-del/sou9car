import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendInspectionBookedEmail } from "@/lib/email";
import { creditPlatform } from "@/lib/credit-wallet";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { listingId, location, scheduledAt, notes } = await req.json();

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { email: true, name: true } } },
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const buyer = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });

  const inspection = await prisma.inspection.create({
    data: {
      listingId,
      buyerId: session.userId,
      location,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      notes,
      price: 300,
      status: "PENDING",
    },
  });

  // Platform collects inspection fee
  await creditPlatform(300, `Revenue inspection — ${listing.brand} ${listing.model} ${listing.year}`);

  // Notify the platform owner (seller gets notified too in production)
  const adminEmail = process.env.ADMIN_EMAIL || listing.seller.email;
  sendInspectionBookedEmail({
    ownerEmail: adminEmail,
    buyerName: buyer?.name ?? "A buyer",
    listingTitle: `${listing.brand} ${listing.model} ${listing.year}`,
    location: location ?? listing.city,
    scheduledAt,
    inspectionId: inspection.id,
  }).catch(console.error);

  return NextResponse.json({ inspection }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });

  const inspections = await prisma.inspection.findMany({
    where: user?.role === "ADMIN" || user?.role === "INSPECTOR"
      ? user.role === "INSPECTOR" ? { inspectorId: session.userId } : {}
      : { OR: [{ buyerId: session.userId }, { inspectorId: session.userId }] },
    include: {
      listing: { select: { id: true, title: true, brand: true, model: true, year: true, city: true } },
      buyer: { select: { name: true, phone: true } },
      inspector: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ inspections });
}
