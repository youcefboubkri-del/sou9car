"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, ShieldCheck, Handshake } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n";

type StepItem = {
  icon: React.ElementType;
  step: string;
  titleKey: keyof Translations;
  descKey: keyof Translations;
};

const stepItems: StepItem[] = [
  { icon: Search, step: "01", titleKey: "how1_title", descKey: "how1_desc" },
  { icon: ShieldCheck, step: "02", titleKey: "how2_title", descKey: "how2_desc" },
  { icon: Handshake, step: "03", titleKey: "how3_title", descKey: "how3_desc" },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useT();

  return (
    <section className="py-24 md:py-32 bg-[#020208] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-orange-500 font-semibold text-sm tracking-widest uppercase mb-3">{t.how_subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white">{t.how_title}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {stepItems.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative border border-white/10 p-px rounded-2xl bg-white/[0.02] backdrop-blur-sm"
            >
              <div className="p-8 text-center">
                <div className="text-6xl font-black text-white/5 mb-4">{item.step}</div>
                <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t[item.titleKey]}</h3>
                <p className="text-white/40 leading-relaxed text-sm">{t[item.descKey]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
