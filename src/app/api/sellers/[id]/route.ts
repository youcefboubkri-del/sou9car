import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      city: true,
      createdAt: true,
      sellerVerification: { select: { status: true } },
      _count: { select: { listings: true } },
    },
  });

  if (!seller) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const listings = await prisma.listing.findMany({
    where: { sellerId: id, status: "ACTIVE" },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    seller,
    listings: listings.map((l) => ({ ...l, thumbnail: l.images[0]?.url ?? null, images: undefined })),
  });
}
