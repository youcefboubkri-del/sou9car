"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useT } from "@/lib/i18n";

const POPULAR_BRANDS = [
  { name: "Toyota", emoji: "🇯🇵" },
  { name: "Dacia", emoji: "🇷🇴" },
  { name: "Renault", emoji: "🇫🇷" },
  { name: "Mercedes", emoji: "🇩🇪" },
  { name: "BMW", emoji: "🇩🇪" },
  { name: "Peugeot", emoji: "🇫🇷" },
  { name: "Volkswagen", emoji: "🇩🇪" },
  { name: "Hyundai", emoji: "🇰🇷" },
  { name: "Kia", emoji: "🇰🇷" },
  { name: "Citroën", emoji: "🇫🇷" },
  { name: "Ford", emoji: "🇺🇸" },
  { name: "Audi", emoji: "🇩🇪" },
];

export function BrandsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { t } = useT();

  return (
    <section className="py-16 bg-background border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <p className="text-sm font-semibold text-white/40 uppercase tracking-widest">{t.brands_title}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {POPULAR_BRANDS.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/listings?brand=${encodeURIComponent(brand.name)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface rounded-full border border-white/10 text-sm font-semibold text-white/75 hover:border-orange-400 hover:text-orange-500 hover:shadow-md hover:shadow-orange-500/15 transition-all duration-200 group"
              >
                <span className="text-base">{brand.emoji}</span>
                {brand.name}
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: POPULAR_BRANDS.length * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 rounded-full text-sm font-semibold text-white hover:bg-orange-400 transition-all duration-200 shadow-md shadow-orange-500/20"
            >
              {t.brands_all}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
