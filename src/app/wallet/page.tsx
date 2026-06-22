"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Wallet, CreditCard, Building2, CheckCircle, Clock, XCircle, ArrowDownLeft, ArrowUpRight, Upload, Loader2 } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface WalletTx {
  id: string;
  amount: number;
  type: string;
  status: string;
  note: string | null;
  createdAt: string;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000];

const TYPE_LABELS: Record<string, string> = {
  TOPUP_PAYPAL: "Recharge PayPal",
  TOPUP_BANK: "Recharge virement",
  TOPUP_CARD: "Recharge carte",
  DEBIT_ESCROW: "Paiement escrow",
  DEBIT_BOOST: "Boost annonce",
  DEBIT_INSPECTION: "Inspection",
  DEBIT_RESERVATION: "Réservation",
  REFUND: "Remboursement",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "CONFIRMED")
    return <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3 h-3" /> Confirmé</span>;
  if (status === "PENDING")
    return <span className="flex items-center gap-1 text-yellow-400 text-xs"><Clock className="w-3 h-3" /> En attente</span>;
  return <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3 h-3" /> Rejeté</span>;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"paypal" | "bank" | "card">("paypal");
  const [amount, setAmount] = useState(200);
  const [bankProof, setBankProof] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const proofRef = useRef<HTMLInputElement>(null);

  const fetchWallet = useCallback(async () => {
    const res = await fetch("/api/wallet");
    if (res.ok) {
      const d = await res.json();
      setBalance(d.balance);
      setTransactions(d.transactions);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBankProof(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submitBankTransfer() {
    if (amount < 50) { setErrorMsg("Montant minimum : 50 MAD"); return; }
    setSubmitting(true);
    setErrorMsg("");
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, proof: bankProof }),
    });
    const d = await res.json();
    setSubmitting(false);
    if (!res.ok) { setErrorMsg(d.error); return; }
    setSuccessMsg("Demande de recharge envoyée. Elle sera confirmée dans 24h après vérification.");
    fetchWallet();
  }

  async function submitCardPayment() {
    // Card payments go through a manual flow (no Stripe integration yet)
    setErrorMsg("Paiement par carte disponible bientôt. Utilisez PayPal ou virement.");
  }

  const isDebit = (type: string) => type.startsWith("DEBIT");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Balance card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 shadow-2xl shadow-orange-500/20">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 font-semibold text-sm uppercase tracking-widest">Mon Solde</span>
          </div>
          <p className="text-5xl font-black text-white tracking-tight">
            {balance.toLocaleString("fr-MA")} <span className="text-2xl font-bold text-white/70">MAD</span>
          </p>
          <p className="mt-2 text-white/60 text-sm">Utilisable pour escrow, boost et inspections</p>
        </div>

        {/* Recharge section */}
        <div className="bg-surface rounded-3xl border border-white/[0.08] overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.08]">
            <h2 className="text-white font-bold text-lg">Recharger mon solde</h2>
            <p className="text-white/40 text-sm mt-0.5">Choisissez un montant et une méthode de paiement</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Quick amounts */}
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Montant</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(q)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      amount === q
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
                        : "border-white/10 text-white/60 hover:border-orange-500/40 hover:text-white bg-white/[0.03]"
                    }`}
                  >
                    {q} MAD
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={50}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/50"
                  placeholder="Montant personnalisé..."
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">MAD</span>
              </div>
            </div>

            {/* Payment method tabs */}
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">Méthode de paiement</p>
              <div className="flex gap-2 mb-5">
                {(["paypal", "bank", "card"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setSuccessMsg(""); setErrorMsg(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      tab === t
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                        : "border-white/10 text-white/50 hover:text-white hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    {t === "paypal" && <span className="font-black text-blue-400">P</span>}
                    {t === "bank" && <Building2 className="w-4 h-4" />}
                    {t === "card" && <CreditCard className="w-4 h-4" />}
                    {t === "paypal" ? "PayPal" : t === "bank" ? "Virement" : "Carte"}
                  </button>
                ))}
              </div>

              {/* PayPal tab */}
              {tab === "paypal" && (
                <div className="space-y-3">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-300">
                    Paiement sécurisé via PayPal. Votre solde sera crédité instantanément après confirmation.
                  </div>
                  <PayPalScriptProvider
                    options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "sb", currency: "USD" }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={async () => {
                        const res = await fetch("/api/paypal/wallet-topup", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "create", amount }),
                        });
                        const d = await res.json();
                        if (!res.ok) throw new Error(d.error);
                        return d.id;
                      }}
                      onApprove={async (data) => {
                        const res = await fetch("/api/paypal/wallet-topup", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "capture", orderID: data.orderID, amount }),
                        });
                        const d = await res.json();
                        if (!res.ok) { setErrorMsg(d.error); return; }
                        setSuccessMsg(`${amount} MAD crédités sur votre solde !`);
                        fetchWallet();
                      }}
                      onError={() => setErrorMsg("Erreur PayPal. Réessayez.")}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Bank transfer tab */}
              {tab === "bank" && (
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3 text-sm">
                    <p className="text-white/60 font-semibold">Coordonnées bancaires</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/40">Banque</span>
                        <span className="text-white font-medium">Attijariwafa Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">RIB</span>
                        <span className="text-white font-mono text-xs">007787000652930040020664</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Bénéficiaire</span>
                        <span className="text-white font-medium">Sou9Car</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Montant</span>
                        <span className="text-orange-400 font-bold">{amount} MAD</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/50 text-xs mb-2">Joindre le reçu de virement (optionnel mais recommandé)</p>
                    <button
                      onClick={() => proofRef.current?.click()}
                      className="w-full border-2 border-dashed border-white/15 rounded-2xl py-4 flex flex-col items-center gap-2 hover:border-orange-500/40 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-white/30" />
                      <span className="text-white/40 text-sm">
                        {bankProof ? "Reçu chargé ✓" : "Cliquez pour importer"}
                      </span>
                    </button>
                    <input ref={proofRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleProofUpload} />
                  </div>

                  <button
                    onClick={submitBankTransfer}
                    disabled={submitting}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Confirmer la demande de recharge
                  </button>
                </div>
              )}

              {/* Card tab */}
              {tab === "card" && (
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                    <input placeholder="Numéro de carte" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM/AA" className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50" />
                      <input placeholder="CVV" className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50" />
                    </div>
                  </div>
                  <button
                    onClick={submitCardPayment}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                  >
                    Payer {amount} MAD par carte
                  </button>
                </div>
              )}

              {/* Messages */}
              {successMsg && (
                <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <XCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-surface rounded-3xl border border-white/[0.08] overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.08]">
            <h2 className="text-white font-bold text-lg">Historique des transactions</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/30 text-sm">Aucune transaction pour l&apos;instant</div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDebit(tx.type) ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                    {isDebit(tx.type)
                      ? <ArrowUpRight className="w-4 h-4 text-red-400" />
                      : <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{TYPE_LABELS[tx.type] ?? tx.type}</p>
                    {tx.note && <p className="text-white/35 text-xs truncate">{tx.note}</p>}
                    <p className="text-white/25 text-xs">{new Date(tx.createdAt).toLocaleDateString("fr-MA")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${isDebit(tx.type) ? "text-red-400" : "text-emerald-400"}`}>
                      {isDebit(tx.type) ? "-" : "+"}{tx.amount.toLocaleString("fr-MA")} MAD
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
