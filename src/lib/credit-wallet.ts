import { prisma } from "@/lib/prisma";

export async function creditWallet(
  userId: string,
  amount: number,
  type: string,
  note: string
) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId } });
  }
  await prisma.$transaction([
    prisma.walletTransaction.create({
      data: { walletId: wallet.id, amount, type, status: "CONFIRMED", note },
    }),
    prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    }),
  ]);
}

/** Credit the platform admin wallet (first ADMIN user found). */
export async function creditPlatform(amount: number, note: string) {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) await creditWallet(admin.id, amount, "TOPUP_BANK", note);
}
