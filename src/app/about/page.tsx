import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
  title: "À propos de Sou9Car — Marketplace Auto Maroc | عن سوق كار - سوق السيارات بالمغرب",
  description: "Sou9Car est la marketplace automobile la plus fiable du Maroc. Vendeurs vérifiés, historique complet, paiement sécurisé. سوق كار هو أوثق سوق للسيارات في المغرب. بائعون موثقون، تاريخ كامل، دفع آمن.",
  keywords: "sou9car maroc, marketplace auto maroc, سوق السيارات المغرب, voiture fiable maroc, vendeur vérifié maroc, بائع موثق المغرب, achat voiture sécurisé maroc, شراء سيارة آمن المغرب",
};
import Link from "next/link";
import { Shield, Users, MapPin, TrendingUp } from "lucide-react";

const stats = [
  { value: "15,000+", label: "Annonces actives" },
  { value: "98%", label: "Vendeurs vérifiés" },
  { value: "20+", label: "Villes couvertes" },
  { value: "4.9 ★", label: "Note moyenne" },
];

const values = [
  { icon: Shield, title: "La confiance avant tout", desc: "Chaque vendeur passe par une vérification d'identité. Chaque voiture reçoit un contrôle d'historique. Nous ne transigeons pas sur la sécurité." },
  { icon: Users, title: "Fait pour le Maroc", desc: "Nous comprenons le marché marocain — ses prix, ses villes, ses acheteurs. Pas de copie-coller de l'étranger." },
  { icon: MapPin, title: "Couverture locale", desc: "De Casablanca à Agadir, de Tanger à Oujda — nous couvrons tout le royaume." },
  { icon: TrendingUp, title: "Prix équitables", desc: "Les données de marché IA aident acheteurs et vendeurs à s'accorder sur des prix justes basés sur de vraies transactions marocaines." },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block text-orange-500 font-semibold text-sm tracking-widest uppercase mb-4">À propos</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            La marketplace auto<br />
            <span className="text-orange-500">de confiance au Maroc</span>
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
            Sou9Car a été créée pour corriger ce qui est cassé dans le marché marocain de la voiture d&apos;occasion — défauts cachés, fraude au kilométrage, arnaques au paiement et fausses annonces.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-white/[0.08] p-6 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-orange-500 mb-1">{s.value}</p>
              <p className="text-sm text-white/50 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="bg-[#0a0a0a] rounded-3xl p-10 md:p-14 mb-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-5">Notre histoire</h2>
            <p className="text-white/60 leading-relaxed text-lg mb-4">
              Nous en avions assez de voir des acheteurs se faire avoir — des voitures avec des accidents cachés vendues comme &quot;propres&quot;, des compteurs remis à zéro, des vendeurs qui disparaissent après le paiement. Les plateformes existantes ne faisaient rien pour protéger les acheteurs.
            </p>
            <p className="text-white/60 leading-relaxed text-lg">
              Alors nous avons créé Sou9Car : une marketplace où chaque vendeur est vérifié, chaque voiture a un historique documenté, et chaque paiement est protégé par escrow jusqu&apos;à ce que l&apos;acheteur valide le véhicule.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Nos valeurs</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {values.map((v) => (
            <div key={v.title} className="bg-surface rounded-2xl border border-white/[0.08] p-6 shadow-sm flex gap-4">
              <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <v.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{v.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/listings" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-lg shadow-orange-500/20 transition-all hover:scale-105">
            Parcourir les voitures
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 ml-4 border border-white/10 text-white/75 font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/[0.04] transition-all">
            Nous contacter
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
