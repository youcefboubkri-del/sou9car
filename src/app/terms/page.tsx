import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
  title: "Conditions d'utilisation & Confidentialité — Sou9Car | الشروط والخصوصية - سوق كار",
  description: "Conditions générales d'utilisation et politique de confidentialité de Sou9Car, marketplace automobile au Maroc. شروط الاستخدام وسياسة الخصوصية لسوق كار، سوق السيارات بالمغرب.",
  keywords: "conditions utilisation sou9car, politique confidentialité maroc, شروط الاستخدام سوق كار, خصوصية المغرب",
};

const sections = [
  {
    title: "1. Acceptation des conditions",
    content:
      "En accédant ou en utilisant Sou9Car, vous acceptez d'être lié par ces Conditions d'utilisation et notre Politique de confidentialité. Si vous n'êtes pas d'accord, veuillez ne pas utiliser la plateforme.",
  },
  {
    title: "2. Comptes utilisateurs",
    content:
      "Vous devez fournir des informations exactes lors de la création d'un compte. Vous êtes responsable de la confidentialité de vos identifiants. Sou9Car se réserve le droit de suspendre les comptes qui violent nos politiques.",
  },
  {
    title: "3. Annonces",
    content:
      "Les vendeurs doivent fournir des informations exactes et véridiques sur les véhicules mis en vente. Les annonces frauduleuses, le kilométrage falsifié ou les dommages non déclarés sont des motifs de suspension immédiate du compte et peuvent être signalés aux autorités.",
  },
  {
    title: "4. Escrow &amp; Paiements",
    content:
      "Le service escrow de Sou9Car retient les paiements des acheteurs en sécurité jusqu'à ce que l'acheteur confirme la réception et l'approbation du véhicule. Les fonds sont libérés aux vendeurs uniquement après confirmation de l'acheteur ou à l'issue d'une période de résolution des litiges.",
  },
  {
    title: "5. Inspections",
    content:
      "Les services d'inspection professionnelle sont fournis par des inspecteurs tiers. Sou9Car facilite la réservation mais n'est pas responsable des résultats d'inspection. Les rapports d'inspection sont consultatifs et ne constituent pas une garantie de l'état du véhicule.",
  },
  {
    title: "6. Conduite interdite",
    content:
      "Les utilisateurs ne peuvent pas publier d'annonces frauduleuses, tenter de contourner l'escrow, harceler d'autres utilisateurs ou utiliser la plateforme à des fins illégales. Les violations entraîneront des bannissements permanents et des poursuites judiciaires potentielles.",
  },
  {
    title: "7. Confidentialité",
    content:
      "Nous ne collectons que les données nécessaires au fonctionnement de la plateforme. Nous ne vendons pas vos données personnelles à des tiers. Vos coordonnées ne sont partagées qu'avec des contreparties vérifiées dans le cadre d'une transaction active.",
  },
  {
    title: "8. Limitation de responsabilité",
    content:
      "Sou9Car est une plateforme de marketplace et n'est pas partie aux transactions entre acheteurs et vendeurs. Nous ne sommes pas responsables des pertes résultant des transactions effectuées sur la plateforme au-delà de ce qui est couvert par notre service escrow.",
  },
  {
    title: "9. Modifications des conditions",
    content:
      "Nous pouvons mettre à jour ces conditions à tout moment. L'utilisation continue de Sou9Car après les modifications constitue une acceptation des conditions mises à jour. Nous notifierons les utilisateurs des changements importants par email.",
  },
  {
    title: "10. Contact",
    content:
      "Pour toute question sur ces conditions, contactez-nous à legal@sou9car.ma ou visitez notre page Contact.",
  },
];

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <span className="inline-block text-orange-500 font-semibold text-sm tracking-widest uppercase mb-4">Juridique</span>
          <h1 className="text-4xl font-bold text-white mb-3">Conditions &amp; Confidentialité</h1>
          <p className="text-white/40 text-sm">Last updated: June 2026</p>
        </div>

        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-white mb-2">{s.title}</h2>
              <p className="text-white/50 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08] text-sm text-white/40">
          Questions ? <a href="/contact" className="text-orange-500 hover:underline">Contactez-nous</a>
        </div>
      </div>
    </MainLayout>
  );
}
