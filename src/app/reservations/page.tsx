"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import { CalendarCheck, CheckCircle, XCircle, Clock, Loader2, AlertTriangle, Building2, Copy, Upload, ImageIcon } from "lucide-react";
import { PayPalButton } from "@/components/paypal-button";
import { WalletPayButton } from "@/components/wallet-pay-button";
import Link from "next/link";

interface Reservation {
  id: string;
  status: string;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  listing: { id: string; brand: string; model: string; year: number; city: string; price: number };
  buyer: { id: string; name: string; phone: string | null; email: string };
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  return <span className="font-mono text-amber-300">{remaining}</span>;
}

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [bankProof, setBankProof] = useState<Record<string, string>>({});
  const [payMethod, setPayMethod] = useState<Record<string, "paypal" | "bank" | "wallet">>({});
  const RESERVATION_FEE = 300;

  const fetchReservations = useCallback(() => {
    fetch("/api/reservations?role=buyer")
      .then((r) => r.json())
      .then((d) => setReservations(d.reservations ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => { if (!r.ok) router.push("/login"); });
    fetchReservations();
  }, [router, fetchReservations]);

  async function handlePay(id: string, paypalCaptureId?: string, bankTransferProof?: string) {
    setActionId(id);
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pay", paypalCaptureId, bankTransferProof }),
    });
    if (res.ok) fetchReservations();
    setActionId(null);
  }

  const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    PENDING:   { label: "En attente du vendeur", color: "bg-amber-500/15 text-amber-300 border-amber-500/25",   icon: Clock },
    CONFIRMED: { label: "Disponibilité confirmée ✓", color: "bg-blue-500/15 text-blue-300 border-blue-500/25",   icon: CheckCircle },
    REJECTED:  { label: "Rejeté",                   color: "bg-red-500/15 text-red-300 border-red-500/25",       icon: XCircle },
    EXPIRED:   { label: "Expiré",                   color: "bg-white/[0.06] text-white/40 border-white/10",      icon: AlertTriangle },
    PAID:      { label: "Réservé — 300 MAD payé ✓", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", icon: CheckCircle },
  };

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Mes demandes</span>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarCheck className="w-7 h-7 text-orange-400" /> Réservations
          </h1>
          <p className="text-white/40 mt-1 text-sm">Suivez vos demandes de disponibilité. Le vendeur a 2h pour répondre.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p className="font-medium">Aucune réservation</p>
            <p className="text-sm mt-1">Ouvrez une annonce et cliquez sur « Demander disponibilité »</p>
            <Link href="/listings" className="mt-4 inline-block text-orange-400 hover:underline text-sm">Parcourir les annonces →</Link>
          </div>
        ) : (
          reservations.map((r) => {
            const cfg = statusConfig[r.status] ?? statusConfig.EXPIRED;
            const StatusIcon = cfg.icon;
            const method = payMethod[r.id] ?? "paypal";

            return (
              <div key={r.id} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 flex items-center gap-4">
                  <div className="flex-1">
                    <Link href={`/listings/${r.listing.id}`} className="font-bold text-white hover:text-orange-400 transition-colors">
                      {r.listing.brand} {r.listing.model} {r.listing.year}
                    </Link>
                    <p className="text-xs text-white/40 mt-0.5">{r.listing.city} · Demandé le {new Date(r.createdAt).toLocaleDateString("fr-MA")}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border flex items-center gap-1.5 ${cfg.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                </div>

                {/* PENDING: countdown */}
                {r.status === "PENDING" && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-white/60">Le vendeur a jusqu'à <Countdown expiresAt={r.expiresAt} /> pour confirmer la disponibilité.</span>
                    </div>
                  </div>
                )}

                {/* CONFIRMED: pay 300 MAD */}
                {r.status === "CONFIRMED" && (
                  <div className="px-5 pb-5 pt-0 border-t border-white/[0.06]">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-4 mt-4">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-white/70">Le vendeur a confirmé la disponibilité. Payez <strong className="text-white">300 MAD</strong> pour confirmer votre réservation.</span>
                    </div>

                    {/* Payment tabs */}
                    <div className="flex gap-2 mb-4">
                      {(["wallet", "paypal", "bank"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPayMethod((p) => ({ ...p, [r.id]: m }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                            method === m
                              ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                              : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                          }`}
                        >
                          {m === "paypal" ? "PayPal" : m === "bank" ? "Virement" : "💰 Solde"}
                        </button>
                      ))}
                    </div>

                    {actionId === r.id ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
                    ) : method === "wallet" ? (
                      <WalletPayButton
                        amount={RESERVATION_FEE}
                        type="DEBIT_RESERVATION"
                        note={`Réservation — ${r.listing.brand} ${r.listing.model} ${r.listing.year}`}
                        onSuccess={() => handlePay(r.id)}
                      />
                    ) : method === "paypal" ? (
                      <PayPalButton
                        amount={RESERVATION_FEE}
                        currency="MAD"
                        description={`Réservation Sou9Car — ${r.listing.brand} ${r.listing.model} ${r.listing.year}`}
                        onSuccess={(captureId) => handlePay(r.id, captureId)}
                      />
                    ) : (
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-bold text-white">Attijariwafa Bank</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {[
                            { label: "RIB", value: "007787000652930040020664", mono: true, copy: true },
                            { label: "Montant", value: "300 MAD", mono: false, copy: false },
                            { label: "Référence", value: `RES-${r.id.slice(0, 8).toUpperCase()}`, mono: true, copy: false },
                          ].map(({ label, value, mono, copy }) => (
                            <div key={label} className="flex items-center justify-between gap-3 bg-white/[0.04] rounded-lg px-3 py-2">
                              <span className="text-white/40">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`${mono ? "font-mono" : "font-bold"} text-white`}>{value}</span>
                                {copy && (
                                  <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                                    <Copy className="w-3.5 h-3.5 text-orange-400 hover:text-orange-300" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {copied && <p className="text-xs text-emerald-400 text-center">Copié ✓</p>}
                        <p className="text-xs text-white/30 text-center">Incluez la référence dans le libellé</p>

                        {/* Screenshot upload */}
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-orange-400/50 hover:bg-orange-500/5 transition-colors bg-white/[0.02]">
                          {bankProof[r.id] ? (
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs text-emerald-400 font-medium">Screenshot ajouté ✓</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="w-5 h-5 text-white/30" />
                              <span className="text-xs text-white/40">Joindre le screenshot du virement *</span>
                            </div>
                          )}
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setBankProof((p) => ({ ...p, [r.id]: ev.target?.result as string }));
                            reader.readAsDataURL(file);
                          }} />
                        </label>

                        <button
                          onClick={() => handlePay(r.id, undefined, bankProof[r.id])}
                          disabled={!bankProof[r.id]}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/[0.06] disabled:text-white/25 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors"
                        >
                          Confirmer le virement →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PAID */}
                {r.status === "PAID" && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Votre réservation est confirmée. Le vendeur vous contactera pour finaliser l'achat.
                    </div>
                  </div>
                )}

                {/* REJECTED */}
                {r.status === "REJECTED" && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      Le vendeur a indiqué que le véhicule n'est plus disponible.
                    </div>
                  </div>
                )}

                {/* EXPIRED */}
                {r.status === "EXPIRED" && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      La demande a expiré sans réponse du vendeur.{" "}
                      <Link href={`/listings/${r.listing.id}`} className="text-orange-400 hover:underline ml-1">Réessayer →</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </MainLayout>
  );
}
