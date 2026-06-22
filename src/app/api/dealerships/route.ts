import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, description, city, phone, website, plan } = await req.json();

  const existing = await prisma.dealership.findUnique({ where: { userId: session.userId } });
  if (existing) return NextResponse.json({ error: "Already have a dealership account" }, { status: 400 });

  const prices = { BASIC: 299, PRO: 499 };
  const paidUntil = new Date(Date.now() + 30 * 86400000);

  const dealership = await prisma.dealership.create({
    data: {
      userId: session.userId,
      name,
      description,
      city,
      phone,
      website,
      plan: plan || "BASIC",
      status: "ACTIVE",
      paidUntil,
    },
  });

  return NextResponse.json({ dealership, price: prices[plan as keyof typeof prices] || 299 }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ dealership: null });

  const dealership = await prisma.dealership.findUnique({ where: { userId: session.userId } });
  return NextResponse.json({ dealership });
}
