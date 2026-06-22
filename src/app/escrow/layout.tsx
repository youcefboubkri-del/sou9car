import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement Sécurisé Voiture Maroc — Sou9Car | الدفع الآمن للسيارات بالمغرب",
  description: "Achetez une voiture au Maroc en toute sécurité avec l'escrow Sou9Car. Votre argent est protégé jusqu'à réception du véhicule. اشتري سيارة بالمغرب بأمان مع نظام الضمان في سوق كار. أموالك محمية حتى استلام السيارة.",
  keywords: "achat voiture sécurisé maroc, paiement sécurisé voiture, escrow auto maroc, شراء سيارة آمن المغرب, دفع آمن سيارة, ضمان شراء سيارة المغرب, protection acheteur voiture maroc, حماية المشتري سيارات المغرب",
};

export default function EscrowLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
