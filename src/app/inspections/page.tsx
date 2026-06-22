"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, CheckCircle, Loader2, Calendar, MapPin, FileText } from "lucide-react";
import { Suspense } from "react";
import { PayPalButton } from "@/components/paypal-button";
import { WalletPayButton } from "@/components/wallet-pay-button";

function InspectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingIdParam = searchParams.get("listingId");

  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(!!listingIdParam);
  const [payTab, setPayTab] = useState<"wallet" | "paypal">("wallet");

  const [form, setForm] = useState({
    listingId: listingIdParam || "",
    location: "",
    scheduledAt: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => { if (!r.ok) router.push("/login"); });
    fetch("/api/inspections")
      .then((r) => r.json())
      .then((d) => setInspections(d.inspections ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  async function handlePaymentSuccess(captureId: string) {
    setSubmitting(true);
    const res = await fetch("/api/inspections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, paypalCaptureId: captureId }),
    });
    if (res.ok) {
      setSuccess(true);
      setShowForm(false);
      const d = await fetch("/api/inspections").then((r) => r.json());
      setInspections(d.inspections ?? []);
    }
    setSubmitting(false);
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-300",
    CONFIRMED: "bg-blue-500/15 text-blue-300",
    IN_PROGRESS: "bg-purple-500/15 text-purple-300",
    COMPLETED: "bg-emerald-500/15 text-emerald-300",
    CANCELLED: "bg-white/[0.06] text-white/50",
  };

  const inputClass = "w-full px-4 py-3 border border-white/10 rounded-xl text-sm bg-white/[0.04] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Pré-achat</span>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardCheck className="w-7 h-7 text-orange-400" /> Inspections
            </h1>
            <p className="text-white/40 mt-1 text-sm">Contrôle professionnel 150 points — 300 MAD par inspection</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            + Réserver une inspection
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="font-bold text-emerald-300">Inspection réservée !</p>
              <p className="text-emerald-400 text-sm">Nous assignerons un inspecteur professionnel et confirmerons dans les 24h.</p>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={(e) => e.preventDefault()} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-7 mb-8 space-y-4">
            <h2 className="font-bold text-white text-lg">Réserver une inspection</h2>

            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">ID de l&apos;annonce *</label>
              <input required type="text" value={form.listingId} onChange={(e) => setForm({ ...form, listingId: e.target.value })} placeholder="Collez l'ID de l'annonce" className={inputClass} />
              <p className="text-xs text-white/40 mt-1">Trouvez l&apos;ID dans l&apos;URL de l&apos;annonce : /listings/<strong>CETTE-PARTIE</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Lieu de l&apos;inspection *</label>
              <input required type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="ex. Casablanca — Maarif" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Date &amp; heure souhaitées</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/75 mb-1.5">Notes <span className="text-white/40 font-normal">(optionnel)</span></label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Des points spécifiques à vérifier..." className={inputClass + " resize-none"} />
            </div>

            <div className="pt-2 space-y-3">
              <p className="text-xs text-white/40 text-center">
                Frais : <strong className="text-white">300 MAD</strong> — rapport d&apos;inspection 150 points avec photos.
              </p>
              {form.listingId && form.location ? (
                <>
                  {/* Payment method tabs */}
                  <div className="flex gap-2">
                    {(["wallet", "paypal"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayTab(m)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                          payTab === m
                            ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                            : "bg-white/[0.04] border-white/10 text-white/40 hover:text-white/60"
                        }`}
                      >
                        {m === "wallet" ? "💰 Solde" : "PayPal"}
                      </button>
                    ))}
                  </div>

                  {submitting ? (
                    <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
                  ) : payTab === "wallet" ? (
                    <WalletPayButton
                      amount={300}
                      type="DEBIT_INSPECTION"
                      note={`Inspection — ${form.location}`}
                      onSuccess={() => handlePaymentSuccess("wallet")}
                    />
                  ) : (
                    <PayPalButton
                      amount={300}
                      currency="MAD"
                      description="Sou9Car Car Inspection — 300 MAD"
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                </>
              ) : (
                <div className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-sm font-semibold text-center">
                  Renseignez l&apos;ID de l&apos;annonce et le lieu pour payer
                </div>
              )}
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-white/25" />
            <p className="font-medium">Aucune inspection pour l&apos;instant</p>
            <p className="text-sm mt-1">Réservez-en une avant d&apos;acheter votre prochaine voiture</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Mes inspections</h2>
            {inspections.map((ins) => (
              <div key={ins.id} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-5 flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white">{ins.listing.brand} {ins.listing.model} {ins.listing.year}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[ins.status] ?? "bg-white/[0.06] text-white/50"}`}>{{PENDING:"EN ATTENTE",CONFIRMED:"CONFIRMÉ",IN_PROGRESS:"EN COURS",COMPLETED:"TERMINÉ",CANCELLED:"ANNULÉ"}[ins.status] ?? ins.status}</span>
                  </div>
                  {ins.location && <p className="text-sm text-white/50 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ins.location}</p>}
                  {ins.scheduledAt && <p className="text-sm text-white/50 flex items-center gap-1 mt-0.5"><Calendar className="w-3.5 h-3.5" /> {new Date(ins.scheduledAt).toLocaleString("fr-MA")}</p>}
                  {ins.notes && <p className="text-sm text-white/40 mt-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {ins.notes}</p>}
                </div>
                <p className="text-sm font-bold text-white flex-shrink-0">300 MAD</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function InspectionsPage() {
  return <Suspense><InspectionsContent /></Suspense>;
}
