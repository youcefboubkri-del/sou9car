import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET — fetch messages in a conversation + mark as read
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must be a participant
  if (conversation.buyerId !== session.userId && conversation.sellerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: { conversationId: id, receiverId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });

  // Attach listing info if present
  let listing = null;
  if (conversation.listingId) {
    listing = await prisma.listing.findUnique({
      where: { id: conversation.listingId },
      select: { id: true, brand: true, model: true, year: true, price: true, city: true },
    });
  }

  return NextResponse.json({ conversation, listing });
}

// POST — send a message in a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (conversation.buyerId !== session.userId && conversation.sellerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const receiverId =
    conversation.buyerId === session.userId
      ? conversation.sellerId
      : conversation.buyerId;

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.userId,
      receiverId,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
