"use client";

import { useState, useEffect } from "react";
import { Wallet, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface WalletPayButtonProps {
  amount: number;
  type: string;
  note?: string;
  label?: string;
  onSuccess: () => void;
}

export function WalletPayButton({ amount, type, note, label, onSuccess }: WalletPayButtonProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  async function pay() {
    setPaying(true);
    setError("");
    const res = await fetch("/api/wallet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, type, note }),
    });
    const d = await res.json();
    setPaying(false);
    if (!res.ok) { setError(d.error ?? "Erreur de paiement"); return; }
    onSuccess();
  }

  if (loading) {
    return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>;
  }

  const sufficient = (balance ?? 0) >= amount;
  const shortfall = amount - (balance ?? 0);

  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${sufficient ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
        <span className={`flex items-center gap-2 text-sm font-medium ${sufficient ? "text-emerald-300" : "text-red-300"}`}>
          <Wallet className="w-4 h-4" /> Solde disponible
        </span>
        <span className={`font-bold text-sm ${sufficient ? "text-emerald-300" : "text-red-300"}`}>
          {(balance ?? 0).toLocaleString("fr-MA")} MAD
        </span>
      </div>

      {sufficient ? (
        <button
          onClick={pay}
          disabled={paying}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
        >
          {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          {label ?? `Payer ${amount.toLocaleString("fr-MA")} MAD avec mon Solde`}
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Solde insuffisant — il manque {shortfall.toLocaleString("fr-MA")} MAD
          </p>
          <Link
            href="/wallet"
            className="block w-full text-center py-3 border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 rounded-xl text-sm font-bold transition-all"
          >
            Recharger mon solde →
          </Link>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
