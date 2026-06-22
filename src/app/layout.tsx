import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sou9Car — Achat & Vente Voitures au Maroc | سوق كار - شراء وبيع السيارات في المغرب",
  description: "La marketplace automobile la plus fiable du Maroc. Annonces vérifiées, historique du véhicule, inspections professionnelles, paiement sécurisé. أوثق سوق للسيارات في المغرب. إعلانات موثقة، تاريخ المركبة، فحص احترافي، دفع آمن. Casablanca, Rabat, Marrakech, Tanger, Agadir.",
  keywords: "voiture occasion maroc, achat voiture maroc, vente voiture maroc, سيارات مستعملة المغرب, شراء سيارة المغرب, بيع سيارة المغرب, voiture casablanca, سيارات الدار البيضاء, voiture rabat, سيارات الرباط, marketplace auto maroc, سوق السيارات المغرب, voiture occasion pas cher maroc, سيارة للبيع بالمغرب, annonces voitures maroc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
        {/* hreflang — same URL serves both languages */}
        <link rel="alternate" hrefLang="fr-MA" href="https://sou9car.ma/" />
        <link rel="alternate" hrefLang="ar-MA" href="https://sou9car.ma/" />
        <link rel="alternate" hrefLang="x-default" href="https://sou9car.ma/" />
        {/* Open Graph */}
        <meta property="og:site_name" content="Sou9Car" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_MA" />
        <meta property="og:locale:alternate" content="ar_MA" />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
