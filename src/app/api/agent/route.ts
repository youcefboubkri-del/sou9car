import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { sendAgentConversationEmail } from "@/lib/email";

// Client initialized per-request so env vars are always fresh
function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are Sou9Bot, the official AI assistant for Sou9Car — Morocco's most trusted car marketplace.

Your role:
- Help buyers find the right car based on their budget, needs, and preferences
- Answer questions about listings, prices, vehicle history, inspections, and escrow
- Help sellers understand how to list their car, boost it, and get verified
- Mediate between buyers and sellers professionally and neutrally
- Always respond in the same language the user writes in (Arabic, French, or English)
- Be friendly, concise, and helpful — like a knowledgeable car expert friend

Key pricing info:
- Listing boost: 49 MAD (7 days) or 149 MAD (30 days)
- Seller verification badge: 99 MAD one-time
- Professional inspection: 300 MAD
- Escrow fee: 1.5% of sale price
- Dealership account: 299 MAD/month (Basic) or 499 MAD/month (Pro)

If someone wants to buy or sell, guide them step by step. If there's a dispute between buyer and seller, be fair and professional. Always recommend inspection before buying any car.

Never make up listing prices or specific car availability — tell users to browse /listings for real data.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, listingId } = await req.json() as { messages: Message[]; listingId?: string };

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    // Optionally inject listing context
    let extraContext = "";
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { brand: true, model: true, year: true, price: true, mileage: true, city: true, fuelType: true, transmission: true },
      });
      if (listing) {
        extraContext = `\n\nThe user is currently viewing: ${listing.brand} ${listing.model} ${listing.year} — ${listing.price.toLocaleString()} MAD — ${listing.mileage.toLocaleString()} km — ${listing.city}.`;
      }
    }

    const client = getClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: SYSTEM_PROMPT + extraContext,
      messages,
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "";

    // Email Youssef when conversation reaches 3+ messages (meaningful exchange)
    if (messages.length >= 3 && messages.length % 4 === 3) {
      const summary = messages.slice(-4).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      sendAgentConversationEmail({ summary, listingId }).catch(console.error);
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Agent error:", msg);
    return NextResponse.json({ reply: "Sorry, I'm having a technical issue. Please try again in a moment.", debug: msg });
  }
}
