"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, X, CheckCircle, Car, Camera, FileText } from "lucide-react";
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, MOROCCAN_CITIES } from "@/lib/utils";
import { MainLayout } from "@/components/layout/main-layout";

const STEPS = [
  { num: 1, label: "Détails", icon: Car },
  { num: 2, label: "Photos & Historique", icon: Camera },
  { num: 3, label: "Récapitulatif", icon: FileText },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    title: "", brand: "", model: "", year: "", mileage: "",
    price: "", fuelType: "Diesel", transmission: "Manual",
    bodyType: "SUV", color: "", engineSize: "", power: "",
    doors: "", seats: "", city: "Casablanca",
    description: "", isVintage: false, isImport: false,
    isDamaged: false, hasWarranty: false,
    vinNumber: "", registrationNumber: "",
    previousOwners: "", importedFrom: "", customsCleared: false,
    creditEnabled: false, creditDownPayment: "", creditMonths: "36", creditInterestRate: "0",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (!r.ok) { router.push("/login"); return; } setAuthed(true); })
      .catch(() => router.push("/login"));
  }, [router]);

  // Auto-generate title from brand + model + year
  useEffect(() => {
    if (form.brand && form.model && form.year) {
      setForm((p) => ({ ...p, title: `${form.brand} ${form.model} ${form.year}` }));
    }
  }, [form.brand, form.model, form.year]);

  function updateField(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setImages((prev) => (prev.length < 10 ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/listings/${data.listing.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'annonce");
    } finally {
      setLoading(false);
    }
  }

  if (authed === null) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </MainLayout>
    );
  }

  const inputClass = "w-full px-3 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.04] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";
  const labelClass = "block text-sm font-medium text-white/75 mb-1.5";

  return (
    <MainLayout>
      {/* Dark header bar */}
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/listings" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux annonces
          </Link>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-1">Vendre ma voiture</p>
          <h1 className="text-3xl font-bold text-white">Créer mon annonce</h1>
          <p className="text-white/40 mt-1 text-sm">Publiez sur la marketplace la plus fiable du Maroc — gratuitement</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-2">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => step > s.num && setStep(s.num)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  step === s.num
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : step > s.num
                    ? "text-white/50 hover:bg-white/[0.04] cursor-pointer"
                    : "text-white/30 cursor-default"
                }`}
              >
                {step > s.num ? (
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-px h-6 bg-white/[0.06] mx-1" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-300 text-sm rounded-xl p-3 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Marque *</label>
                  <select value={form.brand} onChange={(e) => updateField("brand", e.target.value)} required className={inputClass}>
                    <option value="">Sélectionner une marque</option>
                    {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Modèle *</label>
                  <input type="text" value={form.model} onChange={(e) => updateField("model", e.target.value)} required placeholder="ex. Clio, Golf, 208" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Année *</label>
                  <input type="number" value={form.year} onChange={(e) => updateField("year", e.target.value)} required min="1990" max="2026" placeholder="2020" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Kilométrage (km) *</label>
                  <input type="number" value={form.mileage} onChange={(e) => updateField("mileage", e.target.value)} required min="0" placeholder="85000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Prix (MAD) *</label>
                  <input type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} required min="0" placeholder="95000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Ville *</label>
                  <select value={form.city} onChange={(e) => updateField("city", e.target.value)} required className={inputClass}>
                    {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Carburant</label>
                  <select value={form.fuelType} onChange={(e) => updateField("fuelType", e.target.value)} className={inputClass}>
                    {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Transmission</label>
                  <select value={form.transmission} onChange={(e) => updateField("transmission", e.target.value)} className={inputClass}>
                    {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Carrosserie</label>
                  <select value={form.bodyType} onChange={(e) => updateField("bodyType", e.target.value)} className={inputClass}>
                    {BODY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Couleur</label>
                  <input type="text" value={form.color} onChange={(e) => updateField("color", e.target.value)} placeholder="ex. Blanc, Noir, Bleu" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cylindrée</label>
                  <input type="text" value={form.engineSize} onChange={(e) => updateField("engineSize", e.target.value)} placeholder="ex. 1.6L, 2.0L" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Puissance (ch)</label>
                  <input type="text" value={form.power} onChange={(e) => updateField("power", e.target.value)} placeholder="ex. 110" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Portes</label>
                  <input type="number" value={form.doors} onChange={(e) => updateField("doors", e.target.value)} min="2" max="5" placeholder="5" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Places</label>
                  <input type="number" value={form.seats} onChange={(e) => updateField("seats", e.target.value)} min="2" max="9" placeholder="5" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} required rows={4} placeholder="Décrivez l'état de votre voiture, ses équipements, son historique d'entretien et ses options..." className={inputClass + " resize-none"} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { key: "isVintage", label: "Classique / Vintage" },
                  { key: "isImport", label: "Véhicule importé" },
                  { key: "isDamaged", label: "Véhicule accidenté" },
                  { key: "hasWarranty", label: "Garantie disponible" },
                ].map(({ key, label }) => (
                  <label key={key} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors text-sm font-medium ${
                    form[key as keyof typeof form]
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                      : "border-white/10 text-white/60 hover:bg-white/[0.04]"
                  }`}>
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => updateField(key, e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Credit section */}
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    💳 Paiement en crédit
                  </h3>
                  <p className="text-sm text-white/40 mt-0.5">Proposez aux acheteurs un échelonnement — ça élargit votre audience.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.creditEnabled as boolean}
                    onChange={(e) => updateField("creditEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>

              {form.creditEnabled && (
                <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Apport initial (DH)</label>
                      <input
                        type="number"
                        value={form.creditDownPayment}
                        onChange={(e) => updateField("creditDownPayment", e.target.value)}
                        placeholder="ex: 30000"
                        min="0"
                        className={inputClass}
                      />
                      <p className="text-xs text-white/30 mt-1">
                        {form.price && form.creditDownPayment
                          ? `${Math.round((Number(form.creditDownPayment) / Number(form.price)) * 100)}% du prix`
                          : "Montant payé au départ"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>Durée (mois)</label>
                      <select
                        value={form.creditMonths}
                        onChange={(e) => updateField("creditMonths", e.target.value)}
                        className={inputClass}
                      >
                        {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                          <option key={m} value={m}>{m} mois ({m / 12} an{m > 12 ? "s" : ""})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Taux d&apos;intérêt annuel (%)</label>
                      <input
                        type="number"
                        value={form.creditInterestRate}
                        onChange={(e) => updateField("creditInterestRate", e.target.value)}
                        placeholder="0"
                        min="0"
                        max="30"
                        step="0.1"
                        className={inputClass}
                      />
                      <p className="text-xs text-white/30 mt-1">0% = sans intérêt</p>
                    </div>
                  </div>

                  {/* Live preview */}
                  {form.price && form.creditDownPayment && form.creditMonths && (
                    (() => {
                      const price = Number(form.price);
                      const down = Number(form.creditDownPayment);
                      const months = Number(form.creditMonths);
                      const rate = Number(form.creditInterestRate) / 100 / 12;
                      const principal = price - down;
                      const monthly = rate > 0
                        ? Math.round(principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1))
                        : Math.round(principal / months);
                      const total = down + monthly * months;
                      return (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wide mb-2">Aperçu acheteur</p>
                          <div className="flex items-center gap-6 flex-wrap">
                            <div>
                              <p className="text-white/40 text-xs">Mensualité</p>
                              <p className="text-white font-extrabold text-xl">{monthly.toLocaleString("fr-MA")} DH<span className="text-sm font-normal text-white/40">/mois</span></p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Apport</p>
                              <p className="text-white font-bold">{down.toLocaleString("fr-MA")} DH</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Durée</p>
                              <p className="text-white font-bold">{months} mois</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs">Total payé</p>
                              <p className="text-white font-bold">{total.toLocaleString("fr-MA")} DH</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
            </div>
          )}

          {/* Step 2: Photos & History */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
                <h3 className="font-bold text-white mb-1">Photos</h3>
                <p className="text-sm text-white/40 mb-4">Ajoutez jusqu&apos;à 10 photos. La première photo est la couverture. De bonnes photos vendent plus vite.</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${i === 0 ? "border-orange-400" : "border-white/[0.08]"}`}>
                      <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs text-center py-0.5 font-semibold">Couverture</div>
                      )}
                      <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full hover:bg-black/80">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-500/10 transition-colors bg-white/[0.04]">
                      <Upload className="w-6 h-6 text-white/30 mb-1.5" />
                      <span className="text-xs text-white/40 font-medium">Ajouter une photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
                <h3 className="font-bold text-white mb-1">Historique du véhicule <span className="text-sm font-normal text-white/40">(optionnel mais recommandé)</span></h3>
                <p className="text-sm text-white/40 mb-4">Les annonces avec historique se vendent 3× plus vite et à meilleur prix.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Numéro VIN</label>
                    <input type="text" value={form.vinNumber} onChange={(e) => updateField("vinNumber", e.target.value)} placeholder="VIN 17 caractères" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Numéro d&apos;immatriculation</label>
                    <input type="text" value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} placeholder="ex. 12345-A-XX" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Nombre de propriétaires</label>
                    <input type="number" value={form.previousOwners} onChange={(e) => updateField("previousOwners", e.target.value)} min="0" placeholder="1" className={inputClass} />
                  </div>
                  {form.isImport && (
                    <>
                      <div>
                        <label className={labelClass}>Importé depuis</label>
                        <input type="text" value={form.importedFrom} onChange={(e) => updateField("importedFrom", e.target.value)} placeholder="ex. France, Allemagne" className={inputClass} />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-white/75">
                        <input type="checkbox" checked={form.customsCleared} onChange={(e) => updateField("customsCleared", e.target.checked)} className="rounded accent-orange-500" />
                        Dédouané
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-6">
              <h3 className="font-bold text-white mb-5">Vérifiez votre annonce</h3>

              {images.length > 0 && (
                <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt="" className={`w-20 h-16 rounded-lg object-cover flex-shrink-0 ${i === 0 ? "ring-2 ring-orange-400" : ""}`} />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                {[
                  ["Marque", form.brand], ["Modèle", form.model],
                  ["Année", form.year], ["Kilométrage", form.mileage ? `${Number(form.mileage).toLocaleString()} km` : ""],
                  ["Prix", form.price ? `${Number(form.price).toLocaleString()} MAD` : ""], ["Carburant", form.fuelType],
                  ["Transmission", form.transmission], ["Carrosserie", form.bodyType],
                  ["Ville", form.city], ["Couleur", form.color],
                  ["Moteur", form.engineSize], ["Puissance", form.power ? `${form.power} ch` : ""],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} className="flex gap-2 p-2.5 bg-white/[0.04] rounded-lg">
                    <span className="text-white/40 text-xs w-24 flex-shrink-0 pt-0.5">{label as string}</span>
                    <span className="font-semibold text-white text-xs">{value as string}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {form.hasWarranty && <span className="text-xs bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-full font-medium">Garantie</span>}
                {form.isVintage && <span className="text-xs bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full font-medium">Classique</span>}
                {form.isImport && <span className="text-xs bg-blue-500/15 text-blue-300 px-2.5 py-1 rounded-full font-medium">Importé</span>}
                {form.isDamaged && <span className="text-xs bg-red-500/15 text-red-300 px-2.5 py-1 rounded-full font-medium">Véhicule accidenté</span>}
              </div>

              <div className="bg-white/[0.04] rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className={images.length > 0 ? "text-emerald-400" : "text-red-500"}>
                    {images.length > 0 ? "✓" : "✗"}
                  </span>
                  <span className="text-white/60">{images.length} photo{images.length !== 1 ? "s" : ""} ajoutée{images.length !== 1 ? "s" : ""}</span>
                </div>
                {form.vinNumber && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    Historique du véhicule inclus
                  </div>
                )}
              </div>

              {images.length === 0 && (
                <p className="text-sm text-amber-400 mt-3 flex items-center gap-1.5">
                  ⚠ Au moins une photo est requise pour publier
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2.5 border border-white/10 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-white/[0.04] transition-colors"
            >
              Retour
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="px-8 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:scale-100 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Publier l&apos;annonce
              </button>
            )}
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
