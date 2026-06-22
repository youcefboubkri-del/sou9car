"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import {
  BarChart3, Eye, TrendingUp, Car, Heart,
  ArrowLeft, Loader2, Crown, Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

interface Listing {
  id: string; brand: string; model: string; year: number;
  price: number; city: string; status: string; views: number;
  thumbnail: string | null; createdAt: string; isFeatured: boolean;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  SOLD: "bg-blue-500",
  PENDING: "bg-amber-500",
  HIDDEN: "bg-white/20",
  REJECTED: "bg-red-500",
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.user) { router.push("/login"); return null; }
        // Check dealership plan
        return Promise.all([
          fetch(`/api/listings?sellerId=${d.user.id}&limit=50`).then((r) => r.json()),
          fetch("/api/dealerships").then((r) => r.json()),
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [listingsData, dealerData] = results;
        setListings(listingsData.listings ?? []);
        setIsPro(dealerData?.dealership?.plan === "PRO");
      })
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

  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const active = listings.filter((l) => l.status === "ACTIVE");
  const sold = listings.filter((l) => l.status === "SOLD");
  const featured = listings.filter((l) => l.isFeatured);
  const avgPrice = listings.length
    ? listings.reduce((s, l) => s + l.price, 0) / listings.length
    : 0;

  // Top 5 by views
  const topListings = [...listings].sort((a, b) => b.views - a.views).slice(0, 5);

  // Views per listing bar chart data (max bar = 100%)
  const maxViews = Math.max(...listings.map((l) => l.views), 1);

  // Status distribution
  const statusGroups = listings.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  // City distribution
  const cityGroups = listings.reduce<Record<string, number>>((acc, l) => {
    acc[l.city] = (acc[l.city] || 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityGroups).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dealership" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-7 h-7 text-orange-400" />
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              {isPro && (
                <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
            </div>
            <p className="text-white/40 text-sm">Aperçu des performances de toutes vos annonces</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Eye, label: "Vues totales", value: totalViews.toLocaleString(), sub: "sur toutes les annonces", color: "bg-blue-500/10 text-blue-400" },
            { icon: Car, label: "Annonces actives", value: active.length, sub: `${sold.length} vendue${sold.length !== 1 ? "s" : ""}`, color: "bg-emerald-500/10 text-emerald-400" },
            { icon: TrendingUp, label: "Prix moyen", value: avgPrice > 0 ? formatPrice(avgPrice) : "—", sub: `${listings.length} total`, color: "bg-orange-500/10 text-orange-400" },
            { icon: Zap, label: "À la une", value: featured.length, sub: "annonces boostées", color: "bg-yellow-500/10 text-yellow-400" },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-white">{k.value}</p>
              <p className="text-xs font-semibold text-white/50 mt-0.5">{k.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{k.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top listings by views */}
          <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" /> Top annonces par vues
            </h2>
            {listings.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">Aucune annonce pour l&apos;instant</p>
            ) : (
              <div className="space-y-4">
                {topListings.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/listings/${l.id}`} className="text-sm font-semibold text-white/90 hover:text-orange-500 truncate max-w-[200px]">
                        {l.brand} {l.model} {l.year}
                      </Link>
                      <span className="text-sm font-bold text-white ml-2">{l.views} vues</span>
                    </div>
                    <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(l.views / maxViews) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                        className="h-full bg-orange-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" /> Statut des annonces
            </h2>
            {listings.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">Aucune annonce pour l&apos;instant</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(statusGroups).map(([status, count], i) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${statusColors[status] ?? "bg-white/20"}`} />
                    <span className="text-sm text-white/75 flex-1">{{ACTIVE:"ACTIF",PENDING:"EN ATTENTE",SOLD:"VENDU",HIDDEN:"MASQUÉ",REJECTED:"REJETÉ"}[status] ?? status}</span>
                    <span className="font-bold text-white text-sm">{count}</span>
                    <div className="w-24 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / listings.length) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 }}
                        className={`h-full rounded-full ${statusColors[status] ?? "bg-white/20"}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Cities */}
          <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Annonces par ville
            </h2>
            {topCities.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {topCities.map(([city, count], i) => (
                  <motion.div
                    key={city}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm text-white/75 flex-1 font-medium">{city}</span>
                    <span className="font-bold text-white text-sm">{count}</span>
                    <div className="w-24 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / (topCities[0][1])) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* All listings table */}
          <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Car className="w-5 h-5 text-white/50" /> Performance de toutes les annonces
            </h2>
            {listings.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">Aucune annonce pour l&apos;instant</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[...listings].sort((a, b) => b.views - a.views).map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 py-2 border-b border-white/[0.06] last:border-0">
                    <Link href={`/listings/${l.id}`} className="text-sm font-medium text-white/90 hover:text-orange-500 truncate max-w-[160px]">
                      {l.brand} {l.model} {l.year}
                    </Link>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {l.views}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        l.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-300" :
                        l.status === "SOLD" ? "bg-blue-500/15 text-blue-300" :
                        "bg-white/[0.06] text-white/50"
                      }`}>{{ACTIVE:"ACTIF",PENDING:"EN ATTENTE",SOLD:"VENDU",HIDDEN:"MASQUÉ",REJECTED:"REJETÉ"}[l.status] ?? l.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA if no listings */}
        {listings.length === 0 && (
          <div className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-8 text-center">
            <Car className="w-12 h-12 text-orange-300 mx-auto mb-3" />
            <p className="font-bold text-orange-300 text-lg mb-2">Aucune donnée pour l&apos;instant</p>
            <p className="text-orange-400 text-sm mb-4">Créez votre première annonce pour commencer à suivre les vues et les performances.</p>
            <Link href="/listings/create" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <Car className="w-4 h-4" /> Créer ma première annonce
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
