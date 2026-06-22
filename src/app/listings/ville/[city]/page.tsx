import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { MapPin, ArrowRight, Shield, Star } from "lucide-react";
import { notFound } from "next/navigation";

const CITIES: Record<string, { fr: string; ar: string; region: string; desc: string; keywords: string }> = {
  casablanca: {
    fr: "Casablanca", ar: "الدار البيضاء", region: "Grand Casablanca",
    desc: "Parcourez des milliers d'annonces de voitures d'occasion à Casablanca. Le plus grand marché automobile du Maroc — Dacia, Renault, Toyota, Hyundai et bien plus.",
    keywords: "voiture occasion casablanca, achat voiture casablanca, سيارات مستعملة الدار البيضاء, annonce voiture casa, vente voiture casablanca",
  },
  rabat: {
    fr: "Rabat", ar: "الرباط", region: "Rabat-Salé-Kénitra",
    desc: "Achetez ou vendez votre voiture à Rabat en toute sécurité. Annonces vérifiées, paiement sécurisé, inspection professionnelle disponible.",
    keywords: "voiture occasion rabat, achat voiture rabat, سيارات مستعملة الرباط, annonce voiture rabat, vente voiture rabat",
  },
  marrakech: {
    fr: "Marrakech", ar: "مراكش", region: "Marrakech-Safi",
    desc: "Marché auto de Marrakech — trouvez la meilleure voiture d'occasion dans la ville ocre. SUV, berlines, citadines : toutes les marques disponibles.",
    keywords: "voiture occasion marrakech, achat voiture marrakech, سيارات مستعملة مراكش, annonce voiture marrakech, voiture marrakech pas cher",
  },
  fes: {
    fr: "Fès", ar: "فاس", region: "Fès-Meknès",
    desc: "Voitures d'occasion à Fès — les meilleures annonces de la capitale spirituelle du Maroc. Comparez les prix, vérifiez l'historique, achetez en sécurité.",
    keywords: "voiture occasion fes, achat voiture fes, سيارات مستعملة فاس, annonce voiture fes, voiture fes maroc",
  },
  tanger: {
    fr: "Tanger", ar: "طنجة", region: "Tanger-Tétouan-Al Hoceïma",
    desc: "Marché automobile de Tanger — carrefour entre l'Europe et l'Afrique. Voitures importées, occasions locales, SUV et berlines au meilleur prix.",
    keywords: "voiture occasion tanger, achat voiture tanger, سيارات مستعملة طنجة, voiture importée tanger, annonce voiture tanger",
  },
  agadir: {
    fr: "Agadir", ar: "أكادير", region: "Souss-Massa",
    desc: "Achetez votre voiture à Agadir — la perle du Souss. Annonces locales vérifiées, prix compétitifs, toutes marques disponibles.",
    keywords: "voiture occasion agadir, achat voiture agadir, سيارات مستعملة أكادير, annonce voiture agadir, voiture agadir pas cher",
  },
  meknes: {
    fr: "Meknès", ar: "مكناس", region: "Fès-Meknès",
    desc: "Voitures d'occasion à Meknès — trouvez votre prochaine voiture parmi des centaines d'annonces vérifiées dans la ville des Ismaïles.",
    keywords: "voiture occasion meknes, achat voiture meknes, سيارات مستعملة مكناس, annonce voiture meknes",
  },
  oujda: {
    fr: "Oujda", ar: "وجدة", region: "Oriental",
    desc: "Marché auto d'Oujda — la capitale de l'Oriental. Prix souvent inférieurs à Casablanca, grand choix de véhicules d'occasion.",
    keywords: "voiture occasion oujda, achat voiture oujda, سيارات مستعملة وجدة, annonce voiture oujda, voiture oriental maroc",
  },
  kenitra: {
    fr: "Kénitra", ar: "القنيطرة", region: "Rabat-Salé-Kénitra",
    desc: "Voitures d'occasion à Kénitra — entre Rabat et Tanger. Annonces de particuliers et professionnels, toutes marques, tous budgets.",
    keywords: "voiture occasion kenitra, achat voiture kenitra, سيارات مستعملة القنيطرة, annonce voiture kenitra",
  },
  tetouan: {
    fr: "Tétouan", ar: "تطوان", region: "Tanger-Tétouan-Al Hoceïma",
    desc: "Achetez une voiture à Tétouan — proximité de Tanger et du port de Ceuta, marché automobile dynamique du nord du Maroc.",
    keywords: "voiture occasion tetouan, achat voiture tetouan, سيارات مستعملة تطوان, annonce voiture tetouan",
  },
};

export async function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const info = CITIES[city];
  if (!info) return {};
  return {
    title: `Voiture Occasion ${info.fr} 2026 — Annonces Auto | سيارات مستعملة ${info.ar}`,
    description: `${info.desc} Trouvez votre prochaine voiture sur Sou9Car — marketplace auto fiable au Maroc.`,
    keywords: info.keywords,
  };
}

export default async function CityListingsPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const info = CITIES[city];
  if (!info) notFound();

  const otherCities = Object.entries(CITIES).filter(([k]) => k !== city);

  return (
    <MainLayout>
      {/* Hero */}
      <div className="bg-[#0a0a0a] border-b border-white/5 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">{info.region}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
            Voiture Occasion <span className="text-orange-500">{info.fr}</span>
          </h1>
          <p className="text-white/35 text-lg">{info.ar} — سيارات مستعملة</p>
          <p className="text-white/55 text-sm mt-4 max-w-2xl leading-relaxed">{info.desc}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Trust badges */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Shield, title: "Annonces vérifiées", desc: "Chaque vendeur est contrôlé avant publication" },
            { icon: Star, title: "Inspection disponible", desc: "Faites inspecter la voiture avant d'acheter" },
            { icon: MapPin, title: `Vendeurs à ${info.fr}`, desc: "Rencontrez le vendeur localement, en toute sécurité" },
          ].map((item) => (
            <div key={item.title} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-orange-500/10 border border-orange-500/25 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <p className="text-white font-bold text-lg">Voir toutes les annonces à {info.fr}</p>
            <p className="text-white/50 text-sm">Filtrez par marque, prix, kilométrage et plus encore.</p>
          </div>
          <Link
            href={`/listings?city=${encodeURIComponent(info.fr)}`}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
          >
            Voir les annonces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* SEO text */}
        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Le marché automobile à {info.fr} en 2026</h2>
            <p>{info.desc}</p>
            <p className="mt-3">
              Sur Sou9Car, trouvez des centaines d&apos;annonces de voitures d&apos;occasion à {info.fr} : Dacia Logan, Renault Clio,
              Toyota Corolla, Hyundai i10, Volkswagen Polo et bien d&apos;autres. Tous les budgets sont représentés,
              de 30 000 DH à plus de 300 000 DH.
            </p>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Pourquoi acheter sur Sou9Car à {info.fr} ?</h2>
            <ul className="space-y-2">
              {[
                "Annonces vérifiées — nous contrôlons chaque vendeur pour éviter les arnaques",
                "Paiement sécurisé — votre argent est bloqué jusqu'à validation de la voiture",
                "Inspection professionnelle — nos experts vérifient 150 points sur le véhicule",
                "Contact WhatsApp direct — joignez le vendeur en un clic",
                "Commission 2% seulement — la moins chère du marché marocain",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Vendre votre voiture à {info.fr}</h2>
            <p>
              Vous souhaitez vendre votre voiture à {info.fr} ? Publiez votre annonce gratuitement sur Sou9Car.
              Nos acheteurs actifs dans la région de {info.region} verront votre annonce en priorité.
            </p>
            <Link href="/listings/create" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/[0.06] border border-white/10 rounded-xl text-white text-sm font-semibold hover:border-orange-500/40 transition-colors">
              Publier une annonce gratuite <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Blog link */}
        <div className="mt-10 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            Avant d&apos;acheter, lisez notre guide : <span className="text-white font-medium">Comment éviter les arnaques voiture d&apos;occasion au Maroc</span>
          </p>
          <Link href="/blog/eviter-arnaques-voiture-occasion-maroc" className="text-orange-400 text-sm font-bold hover:underline whitespace-nowrap flex items-center gap-1">
            Lire <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Other cities */}
        <div className="mt-10">
          <h3 className="text-white font-bold mb-4">Autres villes au Maroc</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {otherCities.map(([key, c]) => (
              <Link
                key={key}
                href={`/listings/ville/${key}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-orange-500/30 hover:text-orange-400 text-white/60 text-sm transition-all"
              >
                <MapPin className="w-3 h-3 flex-shrink-0" /> {c.fr}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
