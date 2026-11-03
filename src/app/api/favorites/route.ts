import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/favorites            -> { favorites: string[] } (listing IDs)
// GET /api/favorites?expand=1   -> also { listings: [...] } with card data, newest first
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ favorites: [] });

  const expand = req.nextUrl.searchParams.get("expand") === "1";

  if (!expand) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId },
      select: { listingId: true },
    });
    return NextResponse.json({ favorites: favorites.map((f) => f.listingId) });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          seller: { select: { id: true, name: true, city: true, avatarUrl: true } },
        },
      },
    },
  });

  return NextResponse.json({
    favorites: favorites.map((f) => f.listingId),
    listings: favorites.map(({ listing: l }) => ({
      ...l,
      thumbnail: l.images[0]?.url || null,
      images: undefined,
    })),
  });
}
