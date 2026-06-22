import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspection Voiture Maroc — 150 Points — Sou9Car | فحص السيارة بالمغرب - 150 نقطة",
  description: "Réservez une inspection professionnelle de votre voiture au Maroc. Contrôle en 150 points avant achat. احجز فحصاً احترافياً لسيارتك بالمغرب. 150 نقطة فحص قبل الشراء.",
  keywords: "inspection voiture maroc, contrôle voiture occasion maroc, فحص سيارة المغرب, فحص قبل الشراء المغرب, vérification voiture maroc, مكانيك السيارات المغرب",
};

export default function InspectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
