import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertTriangle, Shield, Lock, BadgeCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Annonces Voitures Occasion Maroc — Sou9Car | إعلانات سيارات مستعملة المغرب",
  description: "Parcourez des milliers d'annonces de voitures occasion au Maroc. Filtrez par marque, ville, prix, année, carburant. تصفح آلاف إعلانات السيارات المستعملة في المغرب. فلتر حسب الماركة، المدينة، السعر، السنة، الوقود. Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda.",
  keywords: "annonces voitures maroc, voiture occasion maroc, سيارات للبيع المغرب, إعلانات سيارات المغرب, voiture occasion casablanca, voiture occasion rabat, voiture occasion marrakech, voiture occasion fes, voiture occasion tanger, voiture occasion agadir, سيارات مستعملة الدار البيضاء, سيارات مستعملة الرباط, سيارات مستعملة مراكش, سيارات مستعملة فاس, سيارات مستعملة طنجة, filtre voiture maroc, recherche voiture maroc, dacia occasion, renault occasion, toyota occasion",
};
import { MainLayout } from "@/components/layout/main-layout";
import { ListingsPageClient } from "@/components/listings/listings-page-client";
import { ListingsHero } from "@/components/listings/listings-hero";

export default function ListingsPage() {
  return (
    <MainLayout>
      {/* Hero bar */}
      <ListingsHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* SOS — Outside-app penalty + protection explainer */}
        <div className="mb-8 space-y-3">

          {/* Red warning: outside deal = 3% */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.3)]">
            <div className="absolute inset-0 bg-red-950/60 animate-pulse" style={{ animationDuration: "2s" }} />
            <div className="relative z-10 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/50">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-300 text-[11px] font-black uppercase tracking-widest mb-0.5">⚠ Avertissement</p>
                <p className="text-white font-extrabold text-base leading-tight">
                  Tout deal conclu hors de Sou9Car est soumis à <span className="text-red-400">4% de commission</span> au lieu de 2%.
                </p>
                <p className="text-white/45 text-xs mt-1">
                  Utilisez l'escrow intégré pour bénéficier du tarif réduit et protéger votre achat. Jamais de deal en dehors de la plateforme.
                </p>
              </div>
              <div className="flex-shrink-0 flex gap-3 sm:flex-col sm:gap-1 text-center">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide">Hors app</p>
                  <p className="text-2xl font-black text-red-400">4%</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Via Sou9Car</p>
                  <p className="text-2xl font-black text-emerald-400">2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Protection explainer */}
          <div className="bg-blue-950/40 border border-blue-500/20 rounded-2xl p-4">
            <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Comment Sou9Car vous protège
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Lock,
                  title: "Paiement bloqué",
                  desc: "Votre argent est retenu par Sou9Car — le vendeur ne reçoit rien tant que vous n'avez pas validé la voiture.",
                },
                {
                  icon: BadgeCheck,
                  title: "Vous inspectez d'abord",
                  desc: "Vous rencontrez le vendeur, vous vérifiez le véhicule. Seulement après votre accord, le paiement est libéré.",
                },
                {
                  icon: Shield,
                  title: "Remboursement garanti",
                  desc: "Un problème ? Vous ouvrez un litige et récupérez votre argent. Zéro risque d'arnaque ou de fuite avec la caisse.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mt-0.5">
                    <item.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <Suspense>
          <ListingsPageClient />
        </Suspense>
      </div>
    </MainLayout>
  );
}
