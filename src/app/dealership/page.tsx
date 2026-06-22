"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, CheckCircle, Loader2, Star, Zap, Shield,
  PlusCircle, Eye, TrendingUp, Car, Globe, Phone,
  ClipboardCheck, Wallet, BarChart3, Crown, Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { PayPalButton } from "@/components/paypal-button";

const PLANS = [
  {
    id: "BASIC",
    label: "Basic",
    price: 299,
    per: "/mois",
    features: ["Page concessionnaire personnalisée", "Annonces illimitées", "Badge de contact", "Annuaire par ville"],
    color: "border-white/10",
  },
  {
    id: "PRO",
    label: "Pro",
    price: 499,
    per: "/mois",
    features: ["Tout ce qui est inclus dans Basic", "Mise en avant sur la page d'accueil", "Support prioritaire", "Tableau de bord analytique", "⭐ Badge Top Concessionnaire"],
    color: "border-orange-400",
    highlight: true,
  },
];

interface Listing {
  id: string; brand: string; model: string; year: number;
  price: number; city: string; status: string; views: number;
  thumbnail: string | null; createdAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300",
  PENDING: "bg-amber-500/15 text-amber-300",
  SOLD: "bg-blue-500/15 text-blue-300",
  HIDDEN: "bg-white/[0.06] text-white/50",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default function DealershipPage() {
  const router = useRouter();
  const [existing, setExisting] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState("BASIC");
  const [showUpgradePaypal, setShowUpgradePaypal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", city: "", phone: "", website: "" });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user) { router.push("/login"); return; }
        setUserId(d.user.id);
        return fetch("/api/dealerships");
      })
      .then((r) => r?.json())
      .then((d) => {
        if (d?.dealership) {
          setExisting(d.dealership);
          // Fetch this dealer's listings
          return fetch(`/api/listings?sellerId=${d.dealership.userId}&limit=50`);
        }
      })
      .then((r) => r?.json())
      .then((d) => { if (d?.listings) setListings(d.listings); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handlePaymentSuccess(captureId: string) {
    setSubmitting(true);
    const res = await fetch("/api/dealerships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, plan, paypalCaptureId: captureId }),
    });
    if (res.ok) setSuccess(true);
    setSubmitting(false);
  }

  async function handleUpgradeSuccess(captureId: string) {
    setUpgrading(true);
    await fetch("/api/dealerships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "PRO", paypalCaptureId: captureId }),
    });
    setExisting((prev: any) => ({ ...prev, plan: "PRO" }));
    setShowUpgradePaypal(false);
    setUpgrading(false);
  }

  const inputClass = "w-full px-4 py-3 border border-white/10 rounded-xl text-sm bg-white/[0.04] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";

  if (loading) return <MainLayout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div></MainLayout>;

  // ── EXISTING DEALERSHIP DASHBOARD ──
  if (existing) {
    const isPro = existing.plan === "PRO";
    const active = listings.filter((l) => l.status === "ACTIVE").length;
    const sold = listings.filter((l) => l.status === "SOLD").length;
    const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);

    const proTools = [
      { icon: Zap, label: "Booster une annonce", desc: "5× plus de vues", href: "/boost", color: "bg-yellow-500/10 border-yellow-500/25 text-yellow-300" },
      { icon: BarChart3, label: "Analytics", desc: "Vues & performances", href: "/analytics", color: "bg-blue-500/10 border-blue-500/25 text-blue-300" },
      { icon: Shield, label: "Se faire vérifier", desc: "Badge de confiance — 99 MAD", href: "/verify", color: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" },
      { icon: ClipboardCheck, label: "Inspections", desc: "Réserver un contrôle pré-achat", href: "/inspections", color: "bg-purple-500/10 border-purple-500/25 text-purple-300" },
      { icon: Wallet, label: "Paiement sécurisé", desc: "Escrow acheteur/vendeur", href: "/escrow", color: "bg-orange-500/10 border-orange-500/25 text-orange-300" },
      { icon: Globe, label: "Page publique", desc: `sou9car.ma/sellers/${existing.userId}`, href: `/sellers/${existing.userId}`, color: "bg-white/[0.04] border-white/10 text-white/75" },
    ];

    return (
      <MainLayout>
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
          <div className="max-w-5xl mx-auto flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Building2 className="w-7 h-7 text-orange-400" />
                <h1 className="text-3xl font-bold text-white">{existing.name}</h1>
                {isPro && (
                  <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${existing.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {existing.status}
                </span>
                {existing.city && <span className="text-white/40 text-sm">{existing.city}</span>}
                {existing.phone && <span className="text-white/40 text-sm flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{existing.phone}</span>}
                {existing.paidUntil && <span className="text-white/30 text-xs">Actif jusqu&apos;au {new Date(existing.paidUntil).toLocaleDateString("fr-MA")}</span>}
              </div>
            </div>
            <Link
              href="/listings/create"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Nouvelle annonce
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Car, label: "Annonces actives", value: active, light: "bg-orange-500/10 text-orange-400" },
              { icon: Eye, label: "Vues totales", value: totalViews.toLocaleString(), light: "bg-blue-500/10 text-blue-400" },
              { icon: TrendingUp, label: "Voitures vendues", value: sold, light: "bg-emerald-500/10 text-emerald-400" },
              { icon: Building2, label: "Total annonces", value: listings.length, light: "bg-white/[0.06] text-white/60" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-surface rounded-2xl border border-white/[0.08] p-5 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* PRO Tools */}
          <div>
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              {isPro ? <><Crown className="w-5 h-5 text-orange-500" /> Outils PRO</> : <><Settings className="w-5 h-5 text-white/50" /> Outils concessionnaire</>}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proTools.map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={t.href}
                    className={`flex flex-col gap-2 p-4 rounded-2xl border-2 hover:shadow-md transition-all ${t.color}`}
                  >
                    <t.icon className="w-6 h-6" />
                    <p className="font-bold text-sm">{t.label}</p>
                    <p className="text-xs opacity-70">{t.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Listings */}
          <div id="analytics">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Mes annonces</h2>
              <Link href="/listings/create" className="text-sm text-orange-500 hover:underline font-semibold">+ Ajouter</Link>
            </div>

            {listings.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-white/[0.08] p-10 text-center text-white/40">
                <Car className="w-10 h-10 mx-auto mb-3 text-white/25" />
                <p className="font-medium">Aucune annonce pour l&apos;instant</p>
                <Link href="/listings/create" className="text-orange-500 font-semibold text-sm hover:underline mt-2 block">Créez votre première annonce →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((l) => (
                  <div key={l.id} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-4 flex items-center gap-4">
                    <div className="w-16 h-14 rounded-xl bg-white/[0.06] overflow-hidden flex-shrink-0">
                      {l.thumbnail
                        ? <img src={l.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-white/20" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{l.brand} {l.model} {l.year}</p>
                      <p className="text-sm text-white/40">{formatPrice(l.price)} · {l.city}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-white/40 flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{l.views}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[l.status] ?? "bg-white/[0.06] text-white/50"}`}>{{ACTIVE:"ACTIF",PENDING:"EN ATTENTE",SOLD:"VENDU",HIDDEN:"MASQUÉ",REJECTED:"REJETÉ"}[l.status] ?? l.status}</span>
                      <Link href={`/listings/${l.id}`} className="text-xs text-orange-500 font-semibold hover:underline">Voir</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upgrade banner for BASIC */}
          {!isPro && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                <div>
                  <p className="font-bold text-white text-lg flex items-center gap-2"><Crown className="w-5 h-5" /> Passer à PRO</p>
                  <p className="text-orange-100 text-sm mt-1">Mise en avant sur la page d&apos;accueil, tableau de bord analytique et badge Top Concessionnaire.</p>
                </div>
                {!showUpgradePaypal && (
                  <button
                    onClick={() => setShowUpgradePaypal(true)}
                    className="bg-white text-orange-500 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors flex-shrink-0"
                  >
                    Passer à PRO — 499 MAD/mois
                  </button>
                )}
              </div>
              {showUpgradePaypal && (
                <div className="bg-white/10 rounded-xl p-4 mt-3">
                  <p className="text-white text-sm font-semibold mb-3 text-center">Payer 499 MAD/mois via PayPal</p>
                  {upgrading ? (
                    <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-white" /></div>
                  ) : (
                    <PayPalButton
                      amount={499}
                      currency="MAD"
                      description="Sou9Car Dealership PRO — 499 MAD/mois"
                      onSuccess={handleUpgradeSuccess}
                    />
                  )}
                  <button onClick={() => setShowUpgradePaypal(false)} className="w-full text-center text-white/60 text-xs mt-2 hover:text-white">Annuler</button>
                </div>
              )}
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  // ── SUCCESS ──
  if (success) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Compte concessionnaire créé !</h1>
          <p className="text-white/50 mb-6">Votre paiement a été reçu via PayPal. Votre page concessionnaire est maintenant en ligne.</p>
          <button onClick={() => router.push("/dealership")} className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl">Aller au tableau de bord</button>
        </div>
      </MainLayout>
    );
  }

  // ── SIGN UP FORM ──
  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Pour les concessionnaires</span>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-orange-400" /> Compte concessionnaire
          </h1>
          <p className="text-white/40 mt-1 text-sm">Page personnalisée · Annonces illimitées · Badge concessionnaire de confiance</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {PLANS.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => setPlan(p.id)}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-6 rounded-2xl border-2 transition-all ${
                plan === p.id
                  ? p.highlight ? "border-orange-400 bg-orange-500/10" : "border-white/20 bg-white/[0.04]"
                  : "border-white/10 bg-surface hover:border-white/15"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-white">{p.label}</span>
                    {p.highlight && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">Recommandé</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-white">{p.price}</span>
                    <span className="text-sm text-white/40">MAD{p.per}</span>
                  </div>
                </div>
                {plan === p.id && <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />}
              </div>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-sm text-white/60 flex items-center gap-1.5">
                    <span className="text-orange-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-7 space-y-4">
          <h2 className="font-bold text-white text-lg">Informations du concessionnaire</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Nom du concessionnaire *</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Auto Premium Casablanca" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Ville *</label>
              <input required type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Casablanca" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6XX XXX XXX" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Site web</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://votreconcession.ma" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/75 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez votre concession..." className={inputClass + " resize-none"} />
          </div>
          <div className="pt-2">
            <p className="text-xs text-white/40 mb-3 text-center">
              <strong className="text-white">{PLANS.find((p_) => p_.id === plan)?.price} MAD/mois</strong> — paiement sécurisé via PayPal
            </p>
            {submitting ? (
              <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
            ) : form.name && form.city ? (
              <PayPalButton
                amount={PLANS.find((p_) => p_.id === plan)?.price ?? 299}
                currency="MAD"
                description={`Sou9Car Concessionnaire ${plan} — ${PLANS.find((p_) => p_.id === plan)?.price} MAD/mois`}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <div className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-sm font-semibold text-center">
                Renseignez le nom et la ville pour payer
              </div>
            )}
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
