export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { createClient } = await import("@libsql/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");
    const { PrismaClient } = await import("@prisma/client");

    const client = createClient({
      url: process.env.DATABASE_URL || "missing",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const adapter = new PrismaLibSql(client);
    const prisma = new PrismaClient({ adapter });

    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, userCount: count, url: process.env.DATABASE_URL });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, stack: e.stack?.slice(0, 500) });
  }
}
