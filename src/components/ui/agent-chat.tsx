"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, RotateCcw, Headphones } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME = "Salam! 👋 Je suis **Sou9Bot**, votre assistant auto. Je peux vous aider à :\n\n• Trouver la voiture idéale selon votre budget\n• Comprendre les prix &amp; les inspections\n• Répondre à vos questions sur l'achat ou la vente\n\nComment puis-je vous aider ?";

export function AgentChat({ listingId }: { listingId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [humanLoading, setHumanLoading] = useState(false);
  const [humanError, setHumanError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function talkToHuman() {
    if (humanLoading) return;
    setHumanLoading(true);
    setHumanError(null);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        window.location.href = "/login?next=/messages";
        return;
      }
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ support: true }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = `/messages/${data.conversation.id}`;
      } else {
        const err = await res.json().catch(() => null);
        setHumanError(
          err?.error === "You are the support team"
            ? "Vous êtes l'équipe support — les réponses des utilisateurs arrivent dans vos Messages."
            : err?.error ?? "Impossible de contacter l'équipe. Réessayez."
        );
      }
    } catch {
      setHumanError("Erreur réseau — réessayez.");
    } finally {
      setHumanLoading(false);
    }
  }

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: WELCOME }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, listingId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez." }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([{ role: "assistant", content: WELCOME }]);
  }

  function renderContent(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transition-colors"
        aria-label="Chatter avec Sou9Bot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-surface rounded-3xl shadow-2xl border border-white/[0.08] flex flex-col overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="bg-[#0a0a0a] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Sou9Bot</p>
                <p className="text-white/40 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" /> En ligne
                </p>
              </div>
              <button onClick={reset} className="text-white/30 hover:text-white/60 transition-colors" title="Nouvelle conversation">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/[0.04]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : "bg-surface text-white/90 rounded-bl-sm shadow-sm border border-white/[0.08]"
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                  />
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-surface border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-white/15 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Talk to a human */}
            <div className="px-3 pt-2 border-t border-white/[0.08] bg-surface">
              <button
                onClick={talkToHuman}
                disabled={humanLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/25 rounded-xl transition-colors disabled:opacity-50"
              >
                {humanLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Headphones className="w-3.5 h-3.5" />}
                Parler à un conseiller — équipe Sou9Car
              </button>
              {humanError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2 mt-2">{humanError}</p>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-surface">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-2.5 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 bg-orange-500 hover:bg-orange-400 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </motion.button>
              </div>
              <p className="text-center text-xs text-white/30 mt-2">Propulsé par Claude AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
