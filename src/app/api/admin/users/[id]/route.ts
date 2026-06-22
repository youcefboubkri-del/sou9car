import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function checkAdmin() {
  const session = await getSession();
  if (!session) return false;
  if (session.role === "ADMIN") return true;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      city: true, avatarUrl: true, emailVerified: true, phoneVerified: true,
      createdAt: true, updatedAt: true,
      subscriptionPlan: true, subscriptionExpiry: true,
      listings: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, brand: true, model: true, price: true, status: true, createdAt: true, views: true },
      },
      _count: {
        select: { listings: true, favorites: true, sentMessages: true, receivedMessages: true, buyerConversations: true },
      },
      sellerVerification: { select: { status: true, verifiedAt: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const data = await req.json();
  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ user: updated });
}
