import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ alerts });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { brand, model, city, maxPrice, minYear, fuelType } = body;

  if (!maxPrice || maxPrice <= 0) {
    return NextResponse.json({ error: "Prix maximum requis" }, { status: 400 });
  }

  const alert = await prisma.priceAlert.create({
    data: {
      userId: session.id,
      email: session.email,
      brand: brand || null,
      model: model || null,
      city: city || null,
      maxPrice: Number(maxPrice),
      minYear: minYear ? Number(minYear) : null,
      fuelType: fuelType || null,
    },
  });

  return NextResponse.json({ alert });
}

export async function DELETE(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  await prisma.priceAlert.updateMany({
    where: { id, userId: session.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
