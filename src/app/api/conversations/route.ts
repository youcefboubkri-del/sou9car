import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET — list all conversations for the current user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: session.userId }, { sellerId: session.userId }],
    },
    include: {
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach unread count per conversation
  const withUnread = await Promise.all(
    conversations.map(async (c) => {
      const unread = await prisma.message.count({
        where: {
          conversationId: c.id,
          receiverId: session.userId,
          readAt: null,
        },
      });
      return { ...c, unreadCount: unread };
    })
  );

  return NextResponse.json({ conversations: withUnread });
}

// POST — create or retrieve a conversation between buyer and seller about a listing.
// Pass { support: true } to open a direct conversation with the Sou9Car team (admin).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { sellerId: requestedSellerId, listingId, support } = await req.json();

  let sellerId = requestedSellerId;
  if (support) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
    if (!admin) return NextResponse.json({ error: "Support is not available right now" }, { status: 503 });
    sellerId = admin.id;
  }

  if (!sellerId) return NextResponse.json({ error: "sellerId required" }, { status: 400 });
  if (sellerId === session.userId) {
    return NextResponse.json(
      { error: support ? "You are the support team" : "Cannot message yourself" },
      { status: 400 }
    );
  }

  // Reuse existing conversation if one already exists.
  // Support conversations have no listing attached, so they stay separate
  // from car conversations even when the admin is also the seller.
  const existing = await prisma.conversation.findFirst({
    where: {
      buyerId: session.userId,
      sellerId,
      ...(support ? { listingId: null } : listingId ? { listingId } : {}),
    },
  });

  if (existing) return NextResponse.json({ conversation: existing });

  const conversation = await prisma.conversation.create({
    data: {
      buyerId: session.userId,
      sellerId,
      listingId: listingId || null,
    },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}
