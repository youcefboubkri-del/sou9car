export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "MISSING";
  const token = process.env.TURSO_AUTH_TOKEN ? "SET" : "MISSING";

  try {
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");
    const { PrismaClient } = await import("@prisma/client");

    const adapter = new PrismaLibSql({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    const prisma = new PrismaClient({ adapter });

    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, userCount: count, url, token });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message?.slice(0, 300), url, token });
  }
}
