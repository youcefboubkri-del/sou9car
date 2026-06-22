import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, listings, activeListings, soldListings, favorites] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.favorite.count(),
  ]);

  const recentListings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      seller: { select: { name: true, email: true } },
      images: { take: 1 },
    },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({
    stats: { users, listings, activeListings, soldListings, favorites },
    recentListings: recentListings.map((l) => ({ ...l, thumbnail: l.images[0]?.url ?? null, images: undefined })),
    recentUsers,
  });
}
