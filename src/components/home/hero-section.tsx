"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { useT } from "@/lib/i18n";

export function HeroSection() {
  const { t } = useT();

  return (
    <div className="relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Full screen WebGL background */}
      <WebGLShader />

      {/* Centered glassmorphism card — matches demo.tsx */}
      <div className="relative border border-white/10 p-2 w-full mx-auto max-w-3xl z-10">
        <main className="relative border border-white/10 py-16 px-6 overflow-hidden backdrop-blur-sm bg-black/20">

          {/* Grid overlay inside card */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 text-white text-center text-5xl sm:text-6xl font-extrabold tracking-tighter md:text-[clamp(2rem,8vw,7rem)]"
          >
            {t.hero_title1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              {t.hero_title2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/60 px-6 text-center text-xs md:text-sm lg:text-lg"
          >
            {t.hero_subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="my-8 flex items-center justify-center gap-1"
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p className="text-xs text-green-500">{t.hero_tagline}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <Link href="/listings">
              <LiquidButton className="text-white border border-white/20 rounded-full" size="xl">
                {t.hero_browse}
              </LiquidButton>
            </Link>
            <Link href="/listings/create">
              <LiquidButton className="text-white border border-orange-500/40 rounded-full bg-orange-500/10" size="xl">
                {t.hero_sell}
              </LiquidButton>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-10"
          >
            {[
              ["15K+", t.stats_listings],
              ["98%", t.stats_verified],
              ["4.9★", t.stats_rating],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-orange-400">{val}</p>
                <p className="text-xs text-white/30 tracking-widest uppercase">{label}</p>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
