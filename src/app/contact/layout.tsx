import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Sou9Car | اتصل بنا - سوق كار",
  description: "Contactez l'équipe Sou9Car. Support, partenariats, questions sur vos annonces de voitures au Maroc. تواصل مع فريق سوق كار. دعم، شراكات، أسئلة حول إعلانات سياراتك في المغرب.",
  keywords: "contact sou9car, support sou9car maroc, اتصل سوق كار, دعم سوق كار المغرب",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
