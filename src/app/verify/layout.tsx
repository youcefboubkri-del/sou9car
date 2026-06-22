import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérification Vendeur — Sou9Car | توثيق البائع - سوق كار",
  description: "Obtenez le badge vérifié Sou9Car et vendez plus vite. احصل على شارة البائع الموثق في سوق كار وبع أسرع.",
  keywords: "vendeur vérifié maroc, badge vérifié voiture maroc, توثيق بائع سيارات المغرب, بائع موثق سوق كار",
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
