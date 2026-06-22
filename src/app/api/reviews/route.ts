import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { reviewedId, listingId, rating, comment } = await req.json();

  if (!reviewedId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Only allow review if buyer has a RELEASED escrow for this listing
  const escrow = await prisma.escrowTransaction.findFirst({
    where: { listingId, buyerId: session.userId, status: "RELEASED" },
  });
  if (!escrow) {
    return NextResponse.json({ error: "Complétez un achat via escrow avant de laisser un avis" }, { status: 403 });
  }

  // Prevent duplicate review
  const existing = await prisma.review.findFirst({
    where: { reviewerId: session.userId, reviewedId, listingId },
  });
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà laissé un avis pour ce vendeur" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      reviewerId: session.userId,
      reviewedId,
      listingId,
      rating,
      comment: comment || null,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reviewedId = searchParams.get("userId");
  if (!reviewedId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { reviewedId },
    include: { reviewer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({ reviews, average: Math.round(avg * 10) / 10, count: reviews.length });
}
