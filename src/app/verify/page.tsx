"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import { Shield, Upload, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PayPalButton } from "@/components/paypal-button";

export default function VerifyPage() {
  const router = useRouter();
  const [existing, setExisting] = useState<{ status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    userIdNumber: "",
    userIdPhoto: "",
    proofOfAddress: "",
  });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => { if (!r.ok) router.push("/login"); });
    fetch("/api/verify-seller")
      .then((r) => r.json())
      .then((d) => { if (d.verification) setExisting(d.verification); })
      .finally(() => setLoading(false));
  }, [router]);

  function toBase64(file: File): Promise<string> {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function handlePaymentSuccess(captureId: string) {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/verify-seller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, paypalCaptureId: captureId }),
    });
    if (res.ok) { setSuccess(true); }
    else { const d = await res.json(); setError(d.error || "Failed"); }
    setSubmitting(false);
  }

  const inputClass = "w-full px-4 py-3 border border-white/10 rounded-xl text-sm bg-white/[0.04] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";

  if (loading) return <MainLayout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div></MainLayout>;

  if (existing) {
    const statusMap = {
      PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/25", label: "En cours d'examen", msg: "Nous examinerons vos documents dans les 24–48 heures." },
      APPROVED: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/25", label: "Vérifié ✓", msg: "Vous avez un badge vendeur vérifié sur toutes vos annonces." },
      REJECTED: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/25", label: "Rejeté", msg: "Votre vérification a été rejetée. Contactez le support." },
    };
    const s = statusMap[existing.status as keyof typeof statusMap];
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className={`border rounded-2xl p-8 ${s.bg}`}>
            <s.icon className={`w-14 h-14 mx-auto mb-4 ${s.color}`} />
            <h2 className="text-xl font-bold text-white mb-2">{s.label}</h2>
            <p className="text-white/50">{s.msg}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Soumis !</h1>
          <p className="text-white/50 mb-6">Nous examinerons vos documents dans les 24–48 heures et vous notifierons par email.</p>
          <button onClick={() => router.push("/dashboard")} className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl">Retour au tableau de bord</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">Confiance &amp; Sécurité</span>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-orange-400" /> Se faire vérifier
          </h1>
          <p className="text-white/40 mt-1 text-sm">Les vendeurs vérifiés vendent 2× plus vite. Frais unique : 99 MAD.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Shield, title: "Badge bleu", desc: "Coche vérifiée sur toutes vos annonces" },
            { icon: CheckCircle, title: "Plus de confiance", desc: "Les acheteurs préfèrent les vendeurs vérifiés" },
            { icon: Clock, title: "Examen 24–48h", desc: "Processus d'approbation rapide" },
          ].map((b) => (
            <div key={b.title} className="bg-surface rounded-2xl border border-white/[0.08] p-4 text-center shadow-sm">
              <b.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-white">{b.title}</p>
              <p className="text-xs text-white/40 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-7 space-y-5">
          <h2 className="font-bold text-white text-lg">Vos documents</h2>

          {error && <div className="bg-red-500/10 border border-red-500/25 text-red-300 text-sm rounded-xl p-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-white/75 mb-1.5">Numéro CIN *</label>
            <input
              required
              type="text"
              value={form.userIdNumber}
              onChange={(e) => setForm({ ...form, userIdNumber: e.target.value })}
              placeholder="ex. AB123456"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/75 mb-1.5">Photo CIN (recto) *</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-500/10 transition-colors bg-white/[0.04]">
              {form.userIdPhoto ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Photo téléchargée
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-white/30 mb-2" />
                  <span className="text-sm text-white/40">Cliquez pour télécharger</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setForm({ ...form, userIdPhoto: await toBase64(file) });
              }} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/75 mb-1.5">Justificatif de domicile <span className="text-white/40 font-normal">(optionnel)</span></label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-500/10 transition-colors bg-white/[0.04]">
              {form.proofOfAddress ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Document téléchargé
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-white/30 mb-1.5" />
                  <span className="text-sm text-white/40">Facture, relevé bancaire, etc.</span>
                </>
              )}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setForm({ ...form, proofOfAddress: await toBase64(file) });
              }} />
            </label>
          </div>

          <div className="pt-2">
            <p className="text-xs text-white/40 mb-3 text-center">
              One-time fee: <strong className="text-white">99 MAD</strong> — secure payment via PayPal
            </p>
            {submitting ? (
              <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
            ) : form.userIdNumber && form.userIdPhoto ? (
              <PayPalButton
                amount={99}
                currency="MAD"
                description="Sou9Car Seller Verification — 99 MAD"
                onSuccess={handlePaymentSuccess}
                onError={() => setError("Paiement échoué. Réessayez.")}
              />
            ) : (
              <div className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/30 text-sm font-semibold text-center">
                Remplissez tous les champs obligatoires pour payer
              </div>
            )}
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
