"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle, Loader2, TrendingUp, Eye, Star, Car } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { PayPalButton } from "@/components/paypal-button";
import { WalletPayButton } from "@/components/wallet-pay-button";

interface Listing {
  id: string; brand: string; model: string; year: number;
  price: number; city: string; thumbnail: string | null;
  isFeatured: boolean; featuredUntil: string | null;
}

const PLANS = [
  {
    id: "7days",
    label: "Boost 7 jours",
    price: 49,
    features: ["En tête des résultats de recherche pendant 7 jours", "Badge à la une sur l'annonce", "3× plus de vues en moyenne"],
    color: "border-orange-400 bg-orange-500/10",
    badge: "Le plus populaire",
  },
  {
    id: "30days",
    label: "Boost 30 jours",
    price: 149,
    features: ["En tête des résultats de recherche pendant 30 jours", "Badge à la une sur l'annonce", "10× plus de vues en moyenne", "Section à la une sur la page d'accueil"],
    color: "border-white/20 bg-white/[0.04]",
    badge: "Meilleur rapport qualité-prix",
  },
];

export default function BoostPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [plan, setPlan] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payTab, setPayTab] = useState<"wallet" | "paypal">("wallet");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (!r.ok) { router.push("/login"); return null; } return r.json(); })
      .then((data) => {
        if (!data?.user) return null;
        return fetch(`/api/listings?sellerId=${data.user.id}&limit=50`);
      })
      .then((r) => r?.json())
      .then((d) => { if (d) setListings(d.listings ?? []); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleBoostSuccess(captureId: string) {
    setSubmitting(true);
    const res = await fetch("/api/boosts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: selected, plan, paypalCaptureId: captureId }),
    });
    if (res.ok) setSuccess(true);
    setSubmitting(false);
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Boost activé !</h1>
          <p className="text-white/50 mb-6">Votre annonce est maintenant mise en avant en tête des résultats de recherche.</p>
          <button onClick={() => router.push("/dashboard")} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-all">
            Retour au tableau de bord
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Promouvoir</span>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-orange-400" /> Booster mon annonce
          </h1>
          <p className="text-white/40 mt-1 text-sm">Obtenez 3 à 10× plus de vues. Placement en tête des résultats.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Eye, label: "Vues supplémentaires", value: "5× plus" },
            { icon: TrendingUp, label: "Vente plus rapide", value: "3× plus vite" },
            { icon: Star, label: "Badge à la une", value: "Inclus" },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-white/[0.08] p-5 text-center shadow-sm">
              <s.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Choose listing */}
          <div>
            <h2 className="font-bold text-white mb-4">1. Sélectionnez votre annonce</h2>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
            ) : listings.length === 0 ? (
              <div className="text-center py-10 text-white/40">
                <p className="mb-3">Aucune annonce pour l&apos;instant.</p>
                <button onClick={() => router.push("/listings/create")} className="text-orange-500 font-semibold hover:underline">Créez d&apos;abord une annonce →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      selected === l.id ? "border-orange-400 bg-orange-500/10" : "border-white/10 bg-surface hover:border-white/15"
                    }`}
                  >
                    <div className="w-14 h-12 rounded-xl bg-white/[0.06] overflow-hidden flex-shrink-0">
                      {l.thumbnail ? <img src={l.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-white/20" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{l.brand} {l.model} {l.year}</p>
                      <p className="text-xs text-white/40">{formatPrice(l.price)} · {l.city}</p>
                    </div>
                    {l.isFeatured && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0"><span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" /> Boosté</span></span>}
                    {selected === l.id && <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Choose plan */}
          <div>
            <h2 className="font-bold text-white mb-4">2. Choisissez un forfait</h2>
            <div className="space-y-4">
              {PLANS.map((p) => (
                <motion.button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    plan === p.id ? p.color + " border-2" : "border-white/10 bg-surface hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.label}</span>
                      <span className="text-xs bg-elevated text-white px-2 py-0.5 rounded-full font-semibold">{p.badge}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-extrabold text-white">{p.price}</span>
                      <span className="text-sm text-white/50">MAD</span>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-sm text-white/60 flex items-center gap-1.5">
                        <span className="text-orange-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>

            {selected ? (
              <div className="mt-5 space-y-3">
                {/* Payment method tabs */}
                <div className="flex gap-2">
                  {(["wallet", "paypal"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayTab(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        payTab === m
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {m === "wallet" ? "💰 Solde" : "PayPal"}
                    </button>
                  ))}
                </div>

                {submitting ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                  </div>
                ) : payTab === "wallet" ? (
                  <WalletPayButton
                    amount={PLANS.find((p) => p.id === plan)?.price ?? 49}
                    type="DEBIT_BOOST"
                    note={`Boost ${PLANS.find((p) => p.id === plan)?.label}`}
                    onSuccess={() => handleBoostSuccess("wallet")}
                  />
                ) : (
                  <PayPalButton
                    amount={PLANS.find((p) => p.id === plan)?.price ?? 49}
                    currency="MAD"
                    description={`Sou9Car Boost — ${PLANS.find((p) => p.id === plan)?.label}`}
                    onSuccess={handleBoostSuccess}
                  />
                )}
              </div>
            ) : (
              <div className="mt-5 w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-sm font-semibold text-center">
                Sélectionnez une annonce pour payer
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
