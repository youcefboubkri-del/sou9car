import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { userIdNumber, userIdPhoto, proofOfAddress } = await req.json();

  const existing = await prisma.sellerVerification.findUnique({ where: { userId: session.userId } });
  if (existing) {
    return NextResponse.json({ error: "Verification already submitted", status: existing.status }, { status: 400 });
  }

  const verification = await prisma.sellerVerification.create({
    data: {
      userId: session.userId,
      userIdNumber,
      userIdPhoto,
      proofOfAddress,
      status: "PENDING",
    },
  });

  return NextResponse.json({ verification }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ verification: null });

  const verification = await prisma.sellerVerification.findUnique({ where: { userId: session.userId } });
  return NextResponse.json({ verification });
}
