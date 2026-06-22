"use client";

import Link from "next/link";
import { Car, Share2, Link2, ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Footer() {
  const { t } = useT();

  const footerLinks = {
    [t.footer_cars]: [
      { label: t.footer_browse, href: "/listings" },
      { label: t.nav_sell, href: "/listings/create" },
      { label: t.nav_favorites, href: "/favorites" },
      { label: t.nav_dashboard, href: "/dashboard" },
    ],
    Vendeurs: [
      { label: t.footer_boost, href: "/boost" },
      { label: t.footer_verify, href: "/verify" },
      { label: "Compte concessionnaire", href: "/dealership" },
      { label: t.footer_inspection, href: "/inspections" },
      { label: t.footer_escrow, href: "/escrow" },
    ],
    [t.footer_company]: [
      { label: t.footer_about, href: "/about" },
      { label: t.footer_contact, href: "/contact" },
      { label: t.footer_terms, href: "/terms" },
    ],
    Villes: [
      { label: "Casablanca", href: "/listings?city=Casablanca" },
      { label: "Rabat", href: "/listings?city=Rabat" },
      { label: "Marrakech", href: "/listings?city=Marrakech" },
      { label: "Tanger", href: "/listings?city=Tanger" },
      { label: "Agadir", href: "/listings?city=Agadir" },
    ],
  };

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span>Sou9<span className="text-orange-500">Car</span></span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mt-3">
              {t.footer_tagline}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-400 hover:border-orange-500/30 transition-colors">
                <Link2 className="w-4 h-4" />
              </a>
              <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-400 hover:border-orange-500/30 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Contact" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-400 hover:border-orange-500/30 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">&copy; {new Date().getFullYear()} Sou9Car. {t.footer_rights}</p>
          <p className="text-xs text-white/25">Fait pour le Maroc 🇲🇦</p>
        </div>
      </div>
    </footer>
  );
}
