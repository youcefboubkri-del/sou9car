"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useT } from "@/lib/i18n";

interface Stats {
  activeListings: number;
  totalUsers: number;
  soldListings: number;
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString("fr-MA")}{suffix}</span>;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { t } = useT();

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { label: t.stats_active, value: stats.activeListings, suffix: "+" },
    { label: t.stats_users, value: stats.totalUsers, suffix: "+" },
    { label: t.stats_sold, value: stats.soldListings, suffix: "+" },
    { label: t.stats_verified_sellers, value: Math.floor(stats.totalUsers * 0.6), suffix: "+" },
  ];

  return (
    <section className="bg-surface border-b border-white/[0.08] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-orange-500">
                <CountUp target={item.value} suffix={item.suffix} />
              </p>
              <p className="text-sm text-white/40 font-medium mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
