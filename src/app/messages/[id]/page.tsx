"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { ArrowLeft, Send, Loader2, Car } from "lucide-react";
import { formatPrice, timeAgo, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

interface Conversation {
  id: string;
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  messages: Message[];
}

interface Listing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [meId, setMeId] = useState<string>("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setConversation(data.conversation);
    if (data.listing) setListing(data.listing);
  }, [id]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user) { router.push("/login"); return; }
        setMeId(d.user.id);
      });

    load().finally(() => setLoading(false));
  }, [router, load]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Poll for new messages every 5s
  useEffect(() => {
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    // Optimistic update
    const temp: Message = {
      id: "temp-" + Date.now(),
      senderId: meId,
      content,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setConversation((prev) => prev ? { ...prev, messages: [...prev.messages, temp] } : prev);

    try {
      await fetch(`/api/conversations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      await load();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
        </div>
      </MainLayout>
    );
  }

  if (!conversation) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center text-white/40">
          Conversation introuvable.
        </div>
      </MainLayout>
    );
  }

  const other = conversation.buyer.id === meId ? conversation.seller : conversation.buyer;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/messages" className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/50" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {other.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-white">{other.name}</p>
            <p className="text-xs text-white/40">
              {conversation.buyer.id === meId ? "Vendeur" : "Acheteur"}
            </p>
          </div>
        </div>

        {/* Listing context */}
        {listing && (
          <Link
            href={`/listings/${listing.id}`}
            className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/25 rounded-2xl px-4 py-3 mb-4 hover:bg-orange-500/15 transition-colors"
          >
            <Car className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-orange-300 text-sm truncate">
                {listing.brand} {listing.model} {listing.year}
              </p>
              <p className="text-xs text-orange-400">{formatPrice(listing.price)} · {listing.city}</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-orange-400 rotate-180" />
          </Link>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          <AnimatePresence initial={false}>
            {conversation.messages.map((msg) => {
              const isMe = msg.senderId === meId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isMe
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : "bg-surface text-white/90 border border-white/[0.08] shadow-sm rounded-bl-sm"
                    )}
                  >
                    <p>{msg.content}</p>
                    <p className={cn("text-xs mt-1", isMe ? "text-orange-200" : "text-white/40")}>
                      {timeAgo(new Date(msg.createdAt))}
                      {isMe && msg.readAt && " · Lu"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {conversation.messages.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <p className="text-sm">Aucun message pour l&apos;instant.</p>
              <p className="text-xs mt-1">Dites bonjour à {other.name} !</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.08] pt-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Envoyer un message à ${other.name}...`}
              className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
            />
            <motion.button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors shadow-md shadow-orange-500/20"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
