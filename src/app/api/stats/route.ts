import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET() {
  try {
    const [totalListings, activeListings, totalUsers, soldListings] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.listing.count({ where: { status: "SOLD" } }),
    ]);

    return NextResponse.json({ totalListings, activeListings, totalUsers, soldListings });
  } catch {
    return NextResponse.json({ totalListings: 0, activeListings: 0, totalUsers: 0, soldListings: 0 });
  }
}
