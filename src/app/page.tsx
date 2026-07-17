import type { Metadata } from "next";
import Script from "next/script";
import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { BrandsSection } from "@/components/home/brands-section";
import { RecentListingsSection } from "@/components/home/recent-listings-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { CtaSection } from "@/components/home/cta-section";

export const metadata: Metadata = {
  title: "Sou9Car — Achat & Vente Voitures Occasion au Maroc | شراء وبيع السيارات المستعملة بالمغرب",
  description: "Achetez ou vendez votre voiture au Maroc en toute sécurité. Annonces vérifiées, paiement sécurisé par séquestre, inspection 150 points. اشتري أو بيع سيارتك بالمغرب بأمان. إعلانات موثقة، دفع آمن، فحص 150 نقطة. Casablanca الدار البيضاء · Rabat الرباط · Marrakech مراكش · Tanger طنجة · Agadir أكادير.",
  keywords: "voiture occasion maroc, achat voiture maroc, vente voiture maroc, سيارات مستعملة المغرب, شراء سيارة المغرب, بيع سيارة المغرب, voiture casablanca, سيارات الدار البيضاء, voiture rabat الرباط, voiture marrakech مراكش, voiture tanger طنجة, voiture agadir أكادير, marketplace automobile maroc, سوق السيارات المغرب, dacia occasion maroc, renault occasion maroc, toyota occasion maroc, BMW occasion maroc, mercedes occasion maroc, voiture pas cher maroc, سيارة رخيصة المغرب, vente voiture particulier maroc, garage auto maroc, concessionnaire auto maroc",
  alternates: { canonical: "https://sou9car.ma" },
  openGraph: {
    title: "Sou9Car — Achat & Vente Voitures Occasion au Maroc | شراء وبيع السيارات بالمغرب",
    description: "Annonces vérifiées. Historique véhicule. Paiement sécurisé. La marketplace auto la plus fiable du Maroc. إعلانات موثقة. تاريخ المركبة. دفع آمن.",
    url: "https://sou9car.ma",
    siteName: "Sou9Car",
    type: "website",
    locale: "fr_MA",
    images: [{ url: "https://sou9car.ma/cars/img_lst_bmw5_001.jpg", width: 1200, height: 630, alt: "Sou9Car — Achat & Vente Voitures Occasion au Maroc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sou9Car — Achat & Vente Voitures Occasion au Maroc",
    description: "Annonces vérifiées. Historique véhicule. Paiement sécurisé. La marketplace auto la plus fiable du Maroc.",
    images: ["https://sou9car.ma/cars/img_lst_bmw5_001.jpg"],
  },
};

export default function Home() {
  return (
    <MainLayout>
      <Script
        id="jsonld-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Sou9Car",
            "alternateName": ["سوق كار", "Sou9Car Maroc"],
            "url": "https://sou9car.ma",
            "description": "La marketplace automobile la plus fiable du Maroc — سوق السيارات الأكثر موثوقية في المغرب",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://sou9car.ma/listings?search={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            "areaServed": {
              "@type": "Country",
              "name": "Morocco",
              "alternateName": "Maroc",
            },
            "inLanguage": ["fr", "ar"],
          }),
        }}
      />
      <Script
        id="jsonld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Sou9Car",
            "alternateName": ["سوق كار", "Sou9Car Maroc"],
            "url": "https://sou9car.ma",
            "description": "La marketplace automobile la plus fiable du Maroc — annonces vérifiées, paiement sécurisé par séquestre, inspection 150 points.",
            "areaServed": {
              "@type": "Country",
              "name": "Morocco",
              "alternateName": "Maroc",
            },
          }),
        }}
      />
      <HeroSection />
      <StatsBar />
      <BrandsSection />
      <RecentListingsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </MainLayout>
  );
}
