"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { MessageCircle, Loader2, ArrowRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { motion } from "framer-motion";

interface Conversation {
  id: string;
  listingId: string | null;
  unreadCount: number;
  createdAt: string;
  buyer: { id: string; name: string; avatarUrl: string | null };
  seller: { id: string; name: string; avatarUrl: string | null };
  messages: { content: string; createdAt: string; senderId: string }[];
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user) { router.push("/login"); return; }
        setMeId(d.user.id);
      });

    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Boîte de réception</span>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-7 h-7 text-orange-400" /> Messages
          </h1>
          <p className="text-white/40 mt-1 text-sm">Discutez directement avec acheteurs et vendeurs.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-24">
            <MessageCircle className="w-14 h-14 text-white/25 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white/90 mb-2">Aucun message pour l&apos;instant</h2>
            <p className="text-white/40 mb-6">Contactez un vendeur depuis n&apos;importe quelle annonce pour démarrer une conversation.</p>
            <Link href="/listings" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((c, i) => {
              const other = c.buyer.id === meId ? c.seller : c.buyer;
              const lastMsg = c.messages[0];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/messages/${c.id}`}
                    className="flex items-center gap-4 bg-surface border border-white/[0.08] rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-orange-500/25 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-md shadow-orange-500/20">
                      {other.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-white truncate">{other.name}</p>
                        {lastMsg && (
                          <span className="text-xs text-white/40 flex-shrink-0">{timeAgo(new Date(lastMsg.createdAt))}</span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 truncate mt-0.5">
                        {lastMsg
                          ? (lastMsg.senderId === meId ? "Vous : " : "") + lastMsg.content
                          : "Aucun message — dites bonjour !"}
                      </p>
                    </div>

                    {/* Unread badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
