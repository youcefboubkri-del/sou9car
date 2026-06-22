export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  // Also check DB role in case JWT has stale role
  let isAdmin = session?.role === "ADMIN";
  if (!isAdmin && session?.userId) {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    isAdmin = user?.role === "ADMIN";
  }
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try { await prisma.user.count(); } catch(e: any) { return NextResponse.json({ error: "DB error", detail: e.message }, { status: 500 }); }

  const [
    totalUsers, totalListings, activeListings, soldListings,
    totalMessages, totalConversations, totalFavorites,
    recentUsers, recentListings, recentMessages, recentConversations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.message.count(),
    prisma.conversation.count(),
    prisma.favorite.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, phone: true, role: true, city: true, createdAt: true, emailVerified: true },
    }),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        seller: { select: { name: true, email: true } },
        images: { take: 1, orderBy: { order: "asc" } },
      },
    }),
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
      },
    }),
    prisma.conversation.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        buyer: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers, totalListings, activeListings, soldListings,
      totalMessages, totalConversations, totalFavorites,
    },
    recentUsers,
    recentListings: recentListings.map(({ images, ...l }) => ({
      ...l,
      thumbnail: images[0]?.url ?? null,
    })),
    recentMessages,
    recentConversations,
  });
}

async function checkAdmin() {
  const session = await getSession();
  if (!session) return false;
  if (session.role === "ADMIN") return true;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function DELETE(req: Request) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { type, id } = await req.json();
  if (type === "user") await prisma.user.delete({ where: { id } });
  if (type === "listing") await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { type, id, data } = await req.json();
  if (type === "listing") await prisma.listing.update({ where: { id }, data });
  if (type === "user") await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}
