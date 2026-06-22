import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    select: { listingId: true },
  });

  return NextResponse.json({ favorites: favorites.map((f) => f.listingId) });
}
