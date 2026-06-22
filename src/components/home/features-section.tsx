"use client";

import { Shield, ClipboardCheck, Wallet, Search, Star, Car } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useT } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n";

type FeatureItem = {
  icon: React.ElementType;
  titleKey: keyof Translations;
  descKey: keyof Translations;
  color: string;
};

const featureItems: FeatureItem[] = [
  { icon: Shield, titleKey: "feat_verified_sellers", descKey: "feat_verified_sellers_desc", color: "from-orange-500 to-red-600" },
  { icon: ClipboardCheck, titleKey: "feat_history", descKey: "feat_history_desc", color: "from-blue-500 to-blue-700" },
  { icon: Wallet, titleKey: "feat_escrow", descKey: "feat_escrow_desc", color: "from-orange-600 to-red-600" },
  { icon: Search, titleKey: "feat_inspection", descKey: "feat_inspection_desc", color: "from-purple-500 to-purple-700" },
  { icon: Star, titleKey: "feat_price", descKey: "feat_price_desc", color: "from-amber-500 to-orange-500" },
  { icon: Car, titleKey: "feat_warranty", descKey: "feat_warranty_desc", color: "from-green-500 to-teal-600" },
];

function FeatureCard({ item, index }: { item: FeatureItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useT();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div className="relative border border-white/10 p-px rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all duration-500">
        {/* Glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl" />

        <div className="relative p-6">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
            <item.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">{t[item.titleKey]}</h3>
          <p className="text-white/40 text-sm leading-relaxed">{t[item.descKey]}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const { t } = useT();

  return (
    <section className="py-24 md:py-32 bg-[#020208] relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block text-orange-500 font-semibold text-sm tracking-widest uppercase mb-3">{t.features_subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.features_title}</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            {t.features_desc}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureItems.map((item, i) => (
            <FeatureCard key={item.titleKey} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
