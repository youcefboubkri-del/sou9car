"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { CarCard } from "@/components/listings/car-card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useT } from "@/lib/i18n";

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  city: string;
  thumbnail: string | null;
  createdAt: string;
}

export function RecentListingsSection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const { t } = useT();

  useEffect(() => {
    fetch("/api/listings?limit=8&sort=newest")
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && listings.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-orange-500 font-semibold text-sm tracking-widest uppercase mb-3">
              <Flame className="w-4 h-4" /> {t.recent_subtitle}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">{t.recent_title}</h2>
          </div>
          <Link
            href="/listings"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors group"
          >
            {t.recent_view_all}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.06] overflow-hidden animate-pulse">
                <div className="h-52 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-5 bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, i) => (
              <CarCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            {t.recent_view_all} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
