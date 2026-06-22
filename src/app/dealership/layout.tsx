import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concessionnaire & Garage Auto Maroc — Sou9Car | كونسيسيونير وكراج السيارات بالمغرب",
  description: "Ouvrez votre showroom en ligne sur Sou9Car. Solution professionnelle pour concessionnaires et garages auto au Maroc. افتح صالة عرضك على الإنترنت في سوق كار. حل احترافي لتجار السيارات والكراجات بالمغرب.",
  keywords: "concessionnaire auto maroc, garage voiture maroc, showroom auto maroc, وكالة سيارات المغرب, كراج سيارات المغرب, vente voiture professionnelle maroc, بيع سيارات احترافي المغرب, dealer auto maroc",
};

export default function DealershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
