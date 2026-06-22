"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import { PayPalButton } from "@/components/paypal-button";
import { WalletPayButton } from "@/components/wallet-pay-button";
import { Wallet, CheckCircle, Loader2, Shield, Lock, AlertTriangle, Building2, Copy, Upload, ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function EscrowPage() {
  const router = useRouter();
  const [escrows, setEscrows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<Record<string, "paypal" | "bank" | "wallet">>({});
  const [copied, setCopied] = useState(false);
  const [transferProof, setTransferProof] = useState<Record<string, string>>({});
  const [transferDetails, setTransferDetails] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/me").then((r) => { if (!r.ok) router.push("/login"); });
    fetch("/api/escrow")
      .then((r) => r.json())
      .then((d) => setEscrows(d.escrows ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  async function escrowAction(id: string, action: "fund" | "release", paypalCaptureId?: string) {
    if (actionId) return;
    if (action === "release" && !window.confirm("Libérer le paiement au vendeur ? Ne faites cela qu'après avoir reçu et vérifié le véhicule.")) return;
    setActionId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/escrow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, paypalCaptureId }),
      });
      const data = await res.json();
      if (res.ok) {
        setEscrows((prev) => prev.map((e) => (e.id === id ? { ...e, status: data.escrow.status } : e)));
      } else {
        setActionError(data.error ?? "Action échouée. Veuillez réessayer.");
      }
    } catch {
      setActionError("Erreur réseau — veuillez réessayer.");
    } finally {
      setActionId(null);
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-300",
    FUNDED: "bg-blue-500/15 text-blue-300",
    RELEASED: "bg-emerald-500/15 text-emerald-300",
    REFUNDED: "bg-white/[0.06] text-white/50",
    DISPUTED: "bg-red-500/15 text-red-400",
  };

  const statusIcons: Record<string, typeof CheckCircle> = {
    PENDING: AlertTriangle,
    FUNDED: Lock,
    RELEASED: CheckCircle,
    REFUNDED: CheckCircle,
    DISPUTED: AlertTriangle,
  };

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Paiements sécurisés</span>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="w-7 h-7 text-orange-400" /> Paiement sécurisé
          </h1>
          <p className="text-white/40 mt-1 text-sm">Votre argent est conservé en sécurité par Sou9Car jusqu&apos;à ce que vous et le vendeur confirmiez la transaction. Frais de service : <strong className="text-white">4%</strong>.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* SOS — Outside-app penalty warning */}
        <div className="relative mb-8 rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_32px_rgba(239,68,68,0.35)]">
          {/* Animated red pulse background */}
          <div className="absolute inset-0 bg-red-950/60 animate-pulse" style={{ animationDuration: "2s" }} />
          <div className="relative z-10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-red-500/20 border border-red-500/50">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-300 text-xs font-black uppercase tracking-widest mb-1">⚠ Avertissement — Frais hors plateforme</p>
              <p className="text-white font-extrabold text-lg leading-tight">
                Deal traité hors de Sou9Car ?{" "}
                <span className="text-red-400">5% appliqués</span> au lieu de 4%.
              </p>
              <p className="text-white/50 text-sm mt-1">
                Toute transaction conclue en dehors de l'application est soumise à une commission de <strong className="text-red-300">5%</strong> sur le prix de vente. Utilisez l'escrow Sou9Car et profitez du tarif réduit de <strong className="text-white">4%</strong> + protection acheteur.
              </p>
            </div>
            <div className="flex-shrink-0 text-center bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3">
              <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-1">Hors app</p>
              <p className="text-3xl font-black text-red-400">5%</p>
              <div className="h-px bg-red-500/30 my-2" />
              <p className="text-xs text-white/50 font-bold uppercase tracking-wide mb-1">Via Sou9Car</p>
              <p className="text-3xl font-black text-emerald-400">4%</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { step: "1", title: "L'acheteur finance l'escrow", desc: "Paiement conservé par Sou9Car — le vendeur ne reçoit rien encore" },
            { step: "2", title: "Récupérez le véhicule", desc: "Rencontrez le vendeur, inspectez et prenez livraison" },
            { step: "3", title: "Libérez le paiement", desc: "Approuvez → le vendeur est payé. Problème → remboursement" },
          ].map((s) => (
            <div key={s.step} className="bg-surface rounded-2xl border border-white/[0.08] p-5 shadow-sm">
              <div className="w-8 h-8 bg-orange-500 rounded-full text-white text-sm font-black flex items-center justify-center mb-3">{s.step}</div>
              <p className="font-bold text-white text-sm mb-1">{s.title}</p>
              <p className="text-xs text-white/40">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-5 mb-8 flex items-start gap-3">
          <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-300 text-sm">Comment les paiements sont protégés</p>
            <p className="text-orange-300 text-sm mt-1">Rendez-vous sur n&apos;importe quelle annonce → cliquez sur <strong>« Payer la réservation »</strong>, puis <strong>« Payer maintenant »</strong>. Votre paiement est <strong>conservé par Sou9Car — le vendeur ne le reçoit pas</strong> tant que vous n&apos;avez pas confirmé la réception et vérifié le véhicule. Si les deux parties sont d&apos;accord, l&apos;argent est libéré au vendeur ; en cas de problème, vous êtes remboursé. Des frais de service de <strong>2%</strong> du prix de vente sont ajoutés pour couvrir la protection acheteur.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-white/25" />
            <p className="font-medium">Aucune transaction escrow pour l&apos;instant</p>
            <p className="text-sm mt-1">Démarrez-en une depuis n&apos;importe quelle annonce active</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Mes transactions</h2>
            {actionError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{actionError}</p>
            )}
            {escrows.map((esc) => {
              const StatusIcon = statusIcons[esc.status] ?? AlertTriangle;
              return (
                <div key={esc.id} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/[0.04] rounded-xl flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-6 h-6 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{esc.listing.brand} {esc.listing.model} {esc.listing.year}</p>
                      <p className="text-xs text-white/40">{esc.listing.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-white">{formatPrice(esc.amount)}</p>
                      <p className="text-xs text-white/40">+ {formatPrice(esc.fee)} frais</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[esc.status] ?? "bg-white/[0.06] text-white/50"}`}>
                      {{PENDING:"EN ATTENTE",FUNDED:"FINANCÉ",RELEASED:"LIBÉRÉ",REFUNDED:"REMBOURSÉ",DISPUTED:"EN LITIGE"}[esc.status] ?? esc.status}
                    </span>
                  </div>
                  {esc.status === "PENDING" && (
                    <div className="mt-4 pt-4 border-t border-white/[0.08]">
                      <p className="text-xs text-white/40 mb-3">
                        Total à payer : <strong className="text-white">{formatPrice(esc.amount + esc.fee)}</strong> — conservé en sécurité par Sou9Car jusqu&apos;à ce que vous approuviez le véhicule.
                      </p>
                      {/* Payment method tabs */}
                      <div className="flex gap-2 mb-4">
                        {(["wallet", "paypal", "bank"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setPayMethod((prev) => ({ ...prev, [esc.id]: m }))}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                              (payMethod[esc.id] ?? "wallet") === m
                                ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                                : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                            }`}
                          >
                            {m === "paypal" ? "PayPal" : m === "bank" ? "Virement" : "💰 Solde"}
                          </button>
                        ))}
                      </div>

                      {actionId === esc.id ? (
                        <div className="flex justify-center py-3">
                          <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                        </div>
                      ) : (payMethod[esc.id] ?? "wallet") === "wallet" ? (
                        <WalletPayButton
                          amount={esc.amount + esc.fee}
                          type="DEBIT_ESCROW"
                          note={`Escrow — ${esc.listing.brand} ${esc.listing.model} ${esc.listing.year}`}
                          onSuccess={() => escrowAction(esc.id, "fund")}
                        />
                      ) : (payMethod[esc.id] ?? "wallet") === "paypal" ? (
                        <PayPalButton
                          amount={esc.amount + esc.fee}
                          currency="MAD"
                          description={`Sou9Car Escrow — ${esc.listing.brand} ${esc.listing.model} ${esc.listing.year}`}
                          onSuccess={(captureId) => escrowAction(esc.id, "fund", captureId)}
                          onError={() => setActionError("Paiement échoué. Veuillez réessayer.")}
                        />
                      ) : (
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                          {/* Bank details */}
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-bold text-white">Attijariwafa Bank</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between gap-3 bg-white/[0.04] rounded-lg px-3 py-2">
                              <span className="text-white/40">RIB</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-white tracking-wide">007787000652930040020664</span>
                                <button
                                  onClick={() => { navigator.clipboard.writeText("007787000652930040020664"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                  className="text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 bg-white/[0.04] rounded-lg px-3 py-2">
                              <span className="text-white/40">Montant</span>
                              <span className="font-bold text-white">{formatPrice(esc.amount + esc.fee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 bg-white/[0.04] rounded-lg px-3 py-2">
                              <span className="text-white/40">Référence</span>
                              <span className="font-mono text-white/70">ESC-{esc.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                          </div>
                          {copied && <p className="text-xs text-emerald-400 text-center">RIB copié ✓</p>}
                          <p className="text-xs text-white/30 text-center">Incluez la référence dans le libellé du virement</p>

                          {/* Divider */}
                          <div className="border-t border-white/[0.06] pt-3">
                            <p className="text-xs font-semibold text-white/60 mb-2">Après avoir effectué le virement :</p>

                            {/* Screenshot upload */}
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-orange-400/50 hover:bg-orange-500/5 transition-colors bg-white/[0.02] mb-2">
                              {transferProof[esc.id] ? (
                                <div className="flex flex-col items-center gap-1">
                                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                                  <span className="text-xs text-emerald-400 font-medium">Screenshot ajouté ✓</span>
                                  <span className="text-xs text-white/30">Cliquer pour changer</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <Upload className="w-5 h-5 text-white/30" />
                                  <span className="text-xs text-white/40">Joindre un screenshot du virement *</span>
                                  <span className="text-xs text-white/20">JPG, PNG, PDF</span>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setTransferProof((p) => ({ ...p, [esc.id]: ev.target?.result as string }));
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>

                            {/* Transfer details */}
                            <textarea
                              rows={2}
                              placeholder="Détails du virement (numéro de reçu, date, banque d'envoi…)"
                              value={transferDetails[esc.id] ?? ""}
                              onChange={(e) => setTransferDetails((p) => ({ ...p, [esc.id]: e.target.value }))}
                              className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/10 rounded-xl text-white/70 placeholder:text-white/25 focus:outline-none focus:border-orange-400/50 resize-none mb-3"
                            />

                            <button
                              onClick={() => escrowAction(esc.id, "fund")}
                              disabled={!transferProof[esc.id]}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/[0.06] disabled:text-white/25 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors"
                            >
                              Confirmer le virement →
                            </button>
                            {!transferProof[esc.id] && (
                              <p className="text-xs text-white/25 text-center mt-1">Joindre le screenshot pour confirmer</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {esc.status === "FUNDED" && (
                    <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center gap-3">
                      <p className="text-xs text-white/40 flex-1">
                        Paiement sécurisé. Rencontrez le vendeur, inspectez le véhicule, puis libérez le paiement une fois satisfait.
                      </p>
                      <button
                        onClick={() => escrowAction(esc.id, "release")}
                        disabled={actionId === esc.id}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {actionId === esc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Véhicule reçu — Libérer le paiement
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
