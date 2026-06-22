import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            avatarUrl: true,
            createdAt: true,
            sellerVerification: { select: { status: true } },
          },
        },
        vehicleHistory: true,
        _count: { select: { favorites: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Listing fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.sellerId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const data = await req.json();
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        status: data.status,
      },
    });

    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error("Listing update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.sellerId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Listing delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
