"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Eye, Car, TrendingUp, List, ArrowRight, Loader2, Zap, Shield, Building2, ClipboardCheck } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  city: string;
  price: number;
  status: string;
  views: number;
  thumbnail: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300",
  PENDING: "bg-amber-500/15 text-amber-300",
  SOLD: "bg-blue-500/15 text-blue-300",
  HIDDEN: "bg-white/[0.06] text-white/50",
  REJECTED: "bg-red-500/15 text-red-400",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "ACTIF",
  PENDING: "EN ATTENTE",
  SOLD: "VENDU",
  HIDDEN: "MASQUÉ",
  REJECTED: "REJETÉ",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.user) { router.push("/login"); return null; }
        setUser(data.user);
        return fetch(`/api/listings?sellerId=${data.user.id}&limit=50`);
      })
      .then((res) => res?.json?.())
      .then((data) => { if (data) setListings(data.listings || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  const active = listings.filter((l) => l.status === "ACTIVE").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const sold = listings.filter((l) => l.status === "SOLD").length;

  const stats = [
    { icon: List, label: "Annonces actives", value: active, color: "bg-orange-500", light: "bg-orange-500/10 text-orange-400" },
    { icon: Eye, label: "Vues totales", value: totalViews.toLocaleString(), color: "bg-blue-500", light: "bg-blue-500/10 text-blue-400" },
    { icon: TrendingUp, label: "Voitures vendues", value: sold, color: "bg-emerald-500", light: "bg-emerald-500/10 text-emerald-400" },
    { icon: Car, label: "Total annonces", value: listings.length, color: "bg-elevated", light: "bg-white/[0.06] text-white/75" },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-sm text-white/40 mb-1">Bon retour</p>
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          </div>
          <Link
            href="/listings/create"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.03] self-start sm:self-auto"
          >
            <PlusCircle className="w-5 h-5" />
            Nouvelle annonce
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Monetization quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Zap, label: "Booster l'annonce", desc: "Obtenez 5× plus de vues", href: "/boost", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25" },
            { icon: Shield, label: "Se faire vérifier", desc: "Badge de confiance — 99 MAD", href: "/verify", color: "bg-blue-500/10 text-blue-400 border-blue-500/25" },
            { icon: ClipboardCheck, label: "Réserver inspection", desc: "Contrôle 150 points — 300 MAD", href: "/inspections", color: "bg-purple-500/10 text-purple-400 border-purple-500/25" },
            { icon: Building2, label: "Concessionnaire", desc: "À partir de 299 MAD/mois", href: "/dealership", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col gap-2 p-4 rounded-2xl border bg-surface hover:shadow-md transition-all group`}
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <p className="font-bold text-white text-sm">{action.label}</p>
              <p className="text-xs text-white/40">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Listings table */}
        <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <h2 className="font-bold text-white">Mes annonces</h2>
            {listings.length > 0 && (
              <Link href="/listings" className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
                Parcourir la marketplace <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {listings.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="font-bold text-white/75 mb-1">Aucune annonce pour l&apos;instant</h3>
              <p className="text-white/40 text-sm mb-6">Commencez par publier votre première voiture — c&apos;est gratuit.</p>
              <Link
                href="/listings/create"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Vendre ma voiture
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.06] transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-xl bg-white/[0.06] overflow-hidden flex-shrink-0 border border-white/[0.08]">
                    {listing.thumbnail ? (
                      <img src={listing.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-white/20" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-sm">{listing.brand} {listing.model}</p>
                    <p className="text-xs text-white/40 mt-0.5">{listing.year} · {listing.city} · {listing.views} vues</p>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="font-bold text-white text-sm">{formatPrice(listing.price)}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[listing.status] ?? "bg-white/[0.06] text-white/50"}`}>
                    {statusLabels[listing.status] ?? listing.status}
                  </span>

                  {/* View link */}
                  <Link
                    href={`/listings/${listing.id}`}
                    className="flex-shrink-0 text-xs text-orange-500 font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Voir →
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
