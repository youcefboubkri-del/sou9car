"use client";

import { useEffect, useState } from "react";
import { CarCard } from "@/components/listings/car-card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Listing {
  id: string; title: string; brand: string; model: string;
  year: number; mileage: number; price: number; fuelType: string;
  transmission: string; bodyType: string; city: string;
  thumbnail: string | null; createdAt: string;
}

export function RelatedListings({ listingId }: { listingId: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    fetch(`/api/listings/${listingId}/related`)
      .then((r) => r.json())
      .then((d) => setListings(d.listings ?? []))
      .catch(() => {});
  }, [listingId]);

  if (listings.length === 0) return null;

  return (
    <section className="border-t border-white/[0.08] pt-10 mt-10">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white">Voitures similaires</h2>
        <p className="text-sm text-white/40 mt-0.5">Vous aimerez peut-être aussi</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {listings.map((l, i) => (
          <CarCard key={l.id} listing={l} index={i} />
        ))}
      </div>
    </section>
  );
}
