import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { brand: true, bodyType: true, price: true, city: true },
  });

  if (!listing) return NextResponse.json({ listings: [] });

  const related = await prisma.listing.findMany({
    where: {
      id: { not: id },
      status: "ACTIVE",
      OR: [
        { brand: listing.brand },
        { bodyType: listing.bodyType },
        { city: listing.city },
      ],
    },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    listings: related.map((l) => ({ ...l, thumbnail: l.images[0]?.url ?? null, images: undefined })),
  });
}
