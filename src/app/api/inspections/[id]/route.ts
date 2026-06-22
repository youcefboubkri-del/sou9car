import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendInspectionConfirmedEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { status, inspectorId, scheduledAt, notes } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (user?.role !== "ADMIN" && user?.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const inspection = await prisma.inspection.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(inspectorId && { inspectorId }),
      ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      ...(notes && { notes }),
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
    include: {
      listing: { select: { brand: true, model: true, year: true } },
      buyer: { select: { email: true, name: true } },
      inspector: { select: { name: true } },
    },
  });

  // Email buyer when confirmed
  if (status === "CONFIRMED" && inspection.inspector) {
    sendInspectionConfirmedEmail({
      buyerEmail: inspection.buyer.email,
      listingTitle: `${inspection.listing.brand} ${inspection.listing.model} ${inspection.listing.year}`,
      inspectorName: inspection.inspector.name,
      scheduledAt: inspection.scheduledAt?.toISOString(),
      location: inspection.location ?? "",
    }).catch(console.error);
  }

  return NextResponse.json({ inspection });
}
