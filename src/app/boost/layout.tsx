import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booster mon Annonce Voiture Maroc — Sou9Car | تعزيز إعلان السيارة بالمغرب",
  description: "Boostez votre annonce de voiture au Maroc pour 5× plus de visibilité. عزز إعلان سيارتك بالمغرب للحصول على 5× أكثر ظهوراً.",
  keywords: "booster annonce voiture maroc, visibilité annonce auto maroc, تعزيز إعلان سيارة المغرب, إعلان مميز سيارة المغرب",
};

export default function BoostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
