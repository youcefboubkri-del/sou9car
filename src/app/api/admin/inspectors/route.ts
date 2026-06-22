import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const inspectors = await prisma.user.findMany({
    where: { role: "INSPECTOR" },
    select: { id: true, name: true, email: true, city: true, phone: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ inspectors });
}
