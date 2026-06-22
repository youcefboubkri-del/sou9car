"use client";
import { useT } from "@/lib/i18n";

export function ListingsHero() {
  const { t } = useT();
  return (
    <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">{t.listings_marketplace}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{t.listings_title}</h1>
        <p className="text-white/40 mt-1 text-sm">{t.listings_subtitle}</p>
      </div>
    </div>
  );
}
