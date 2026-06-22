import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
  });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
    });
  }
  return wallet;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const wallet = await getOrCreateWallet(session.userId);
  return NextResponse.json({ balance: wallet.balance, transactions: wallet.transactions });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { amount, type, note } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ error: "Montant invalide" }, { status: 400 });

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.userId } });
  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: type ?? "DEBIT_ESCROW",
        status: "CONFIRMED",
        note: note ?? null,
      },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    }),
  ]);

  const updated = await prisma.wallet.findUnique({ where: { id: wallet.id } });
  return NextResponse.json({ success: true, balance: updated?.balance });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { amount, proof } = await req.json();
  if (!amount || amount < 50) {
    return NextResponse.json({ error: "Montant minimum : 50 MAD" }, { status: 400 });
  }

  const wallet = await getOrCreateWallet(session.userId);

  const tx = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type: "TOPUP_BANK",
      status: "PENDING",
      proof: proof ?? null,
      note: `Recharge par virement — ${amount} MAD`,
    },
  });

  return NextResponse.json({ transaction: tx }, { status: 201 });
}
