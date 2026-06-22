"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { Calculator, ArrowRight, TrendingDown, TrendingUp, Minus, ChevronDown, Info } from "lucide-react";

// Prix réels du marché marocain 2026 — par modèle
// base2024 = prix d'un modèle 2024 en bon état (DH)
// depr = taux de dépréciation annuel (ex: 0.11 = 11%)
// floor = valeur plancher absolue même très vieille
interface ModelData { base2024: number; depr: number; floor: number }

const MODELS: Record<string, Record<string, ModelData>> = {
  Dacia: {
    Logan:   { base2024: 128000, depr: 0.09, floor: 22000 },
    Sandero: { base2024: 118000, depr: 0.09, floor: 20000 },
    Duster:  { base2024: 195000, depr: 0.10, floor: 55000 },
    Dokker:  { base2024: 140000, depr: 0.11, floor: 30000 },
    Lodgy:   { base2024: 145000, depr: 0.11, floor: 32000 },
  },
  Renault: {
    "Clio":    { base2024: 158000, depr: 0.12, floor: 18000 },
    "Mégane":  { base2024: 185000, depr: 0.13, floor: 32000 },
    "Kadjar":  { base2024: 215000, depr: 0.12, floor: 60000 },
    "Captur":  { base2024: 190000, depr: 0.12, floor: 55000 },
    "Symbol":  { base2024: 108000, depr: 0.11, floor: 22000 },
    "Laguna":  { base2024: 95000,  depr: 0.14, floor: 18000 },
  },
  Toyota: {
    Yaris:   { base2024: 168000, depr: 0.09, floor: 42000 },
    Corolla: { base2024: 235000, depr: 0.09, floor: 50000 },
    RAV4:    { base2024: 345000, depr: 0.10, floor: 95000 },
    Hilux:   { base2024: 385000, depr: 0.08, floor: 120000 },
    Prius:   { base2024: 195000, depr: 0.10, floor: 55000 },
    Camry:   { base2024: 295000, depr: 0.10, floor: 75000 },
  },
  Hyundai: {
    i10:      { base2024: 130000, depr: 0.11, floor: 28000 },
    i20:      { base2024: 165000, depr: 0.11, floor: 38000 },
    i30:      { base2024: 195000, depr: 0.12, floor: 45000 },
    Tucson:   { base2024: 285000, depr: 0.11, floor: 80000 },
    "Santa Fe": { base2024: 370000, depr: 0.11, floor: 100000 },
    Elantra:  { base2024: 185000, depr: 0.12, floor: 40000 },
  },
  Volkswagen: {
    Polo:    { base2024: 195000, depr: 0.12, floor: 45000 },
    Golf:    { base2024: 255000, depr: 0.13, floor: 52000 },
    Passat:  { base2024: 280000, depr: 0.13, floor: 58000 },
    Tiguan:  { base2024: 345000, depr: 0.12, floor: 92000 },
    "T-Roc": { base2024: 300000, depr: 0.12, floor: 82000 },
  },
  Peugeot: {
    "208":       { base2024: 175000, depr: 0.13, floor: 30000 },
    "308":       { base2024: 215000, depr: 0.14, floor: 40000 },
    "2008":      { base2024: 225000, depr: 0.13, floor: 58000 },
    "3008":      { base2024: 295000, depr: 0.13, floor: 70000 },
    "5008":      { base2024: 340000, depr: 0.13, floor: 80000 },
    Partner:     { base2024: 175000, depr: 0.11, floor: 38000 },
  },
  "Citroën": {
    C3:            { base2024: 170000, depr: 0.13, floor: 28000 },
    C4:            { base2024: 210000, depr: 0.13, floor: 45000 },
    "C5 Aircross": { base2024: 285000, depr: 0.13, floor: 72000 },
    Berlingo:      { base2024: 185000, depr: 0.11, floor: 40000 },
  },
  "Mercedes-Benz": {
    "Classe A": { base2024: 380000, depr: 0.14, floor: 85000 },
    "Classe C": { base2024: 490000, depr: 0.14, floor: 92000 },
    "Classe E": { base2024: 620000, depr: 0.14, floor: 110000 },
    GLA:        { base2024: 440000, depr: 0.14, floor: 105000 },
    GLC:        { base2024: 560000, depr: 0.14, floor: 120000 },
    Sprinter:   { base2024: 380000, depr: 0.11, floor: 85000 },
  },
  BMW: {
    "Série 1": { base2024: 360000, depr: 0.15, floor: 72000 },
    "Série 3": { base2024: 435000, depr: 0.15, floor: 82000 },
    "Série 5": { base2024: 590000, depr: 0.15, floor: 105000 },
    X1:        { base2024: 395000, depr: 0.14, floor: 90000 },
    X3:        { base2024: 525000, depr: 0.14, floor: 112000 },
    X5:        { base2024: 720000, depr: 0.14, floor: 150000 },
  },
  Ford: {
    Fiesta:  { base2024: 155000, depr: 0.13, floor: 28000 },
    Focus:   { base2024: 195000, depr: 0.13, floor: 40000 },
    Kuga:    { base2024: 280000, depr: 0.12, floor: 70000 },
    Ranger:  { base2024: 345000, depr: 0.09, floor: 95000 },
    Transit: { base2024: 310000, depr: 0.10, floor: 70000 },
  },
  Kia: {
    Picanto:  { base2024: 135000, depr: 0.11, floor: 30000 },
    Rio:      { base2024: 165000, depr: 0.11, floor: 38000 },
    Sportage: { base2024: 295000, depr: 0.11, floor: 80000 },
    Sorento:  { base2024: 370000, depr: 0.11, floor: 98000 },
    Stonic:   { base2024: 215000, depr: 0.12, floor: 60000 },
  },
  Fiat: {
    Punto:  { base2024: 92000,  depr: 0.13, floor: 15000 },
    "500":  { base2024: 138000, depr: 0.13, floor: 28000 },
    Tipo:   { base2024: 148000, depr: 0.13, floor: 32000 },
    Doblo:  { base2024: 175000, depr: 0.11, floor: 38000 },
    Ducato: { base2024: 280000, depr: 0.10, floor: 65000 },
  },
};

const CONDITIONS: Record<string, { label: string; factor: number }> = {
  excellent: { label: "Excellent — comme neuf, jamais accidenté, carnet complet", factor: 1.05 },
  good:      { label: "Bon — entretien à jour, légères marques d'usage normales", factor: 0.92 },
  fair:      { label: "Correct — quelques réparations à prévoir dans l'année", factor: 0.76 },
  poor:      { label: "Mauvais — problèmes mécaniques ou dommages carrosserie", factor: 0.58 },
};

function estimatePrice(
  brand: string,
  model: string,
  year: number,
  mileage: number,
  condition: string
): { min: number; mid: number; max: number } | null {
  const modelData = MODELS[brand]?.[model];
  if (!modelData) return null;

  const age = 2026 - year; // 0 = 2026, 1 = 2025...

  // Prix de base après dépréciation annuelle
  const ageFactor = Math.pow(1 - modelData.depr, age);
  let value = modelData.base2024 * ageFactor;

  // Kilométrage : km attendu en Morocco = 20 000/an
  const expectedKm = age * 20000;
  const kmDiff = mileage - expectedKm;
  // Pénalité si km > attendu (max -18%), bonus si km < attendu (max +7%)
  const kmAdj = kmDiff > 0
    ? -Math.min(0.18, (kmDiff / 150000) * 0.18)
    : Math.min(0.07, Math.abs(kmDiff) / 80000 * 0.07);
  value *= (1 + kmAdj);

  // Plancher absolu
  value = Math.max(value, modelData.floor);

  // Condition
  const condFactor = CONDITIONS[condition]?.factor ?? 0.92;
  value *= condFactor;

  // Arrondi au 1000 DH le plus proche
  const mid = Math.round(value / 1000) * 1000;
  const min = Math.round(mid * 0.88 / 1000) * 1000;
  const max = Math.round(mid * 1.12 / 1000) * 1000;

  return { min, mid, max };
}

function formatDH(n: number) {
  return n.toLocaleString("fr-MA") + " DH";
}

export default function EstimateurPage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2020);
  const [mileage, setMileage] = useState(80000);
  const [condition, setCondition] = useState("good");
  const [result, setResult] = useState<{ min: number; mid: number; max: number } | null>(null);
  const [attempted, setAttempted] = useState(false);

  const brandList = Object.keys(MODELS);
  const modelList = brand ? Object.keys(MODELS[brand] ?? {}) : [];

  function handleEstimate() {
    setAttempted(true);
    if (!brand || !model) return;
    setResult(estimatePrice(brand, model, year, mileage, condition));
  }

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Outil gratuit</p>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calculator className="w-7 h-7 text-orange-400" /> Estimateur de prix
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            Combien vaut votre voiture au Maroc en 2026 ? Estimation basée sur les prix réels du marché.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-5">

          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Marque *</label>
            <div className="relative">
              <select
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setModel(""); setResult(null); setAttempted(false); }}
                className={`w-full appearance-none bg-white/[0.06] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors ${attempted && !brand ? "border-red-500/50" : "border-white/10"}`}
              >
                <option value="">Sélectionner une marque...</option>
                {brandList.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Modèle *</label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => { setModel(e.target.value); setResult(null); }}
                disabled={!brand}
                className={`w-full appearance-none bg-white/[0.06] border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors disabled:opacity-40 ${attempted && !model ? "border-red-500/50" : "border-white/10"}`}
              >
                <option value="">Sélectionner un modèle...</option>
                {modelList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Année — <span className="text-orange-400 font-bold">{year}</span>
            </label>
            <input
              type="range" min={2006} max={2025} value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setResult(null); }}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1"><span>2006</span><span>2025</span></div>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Kilométrage — <span className="text-orange-400 font-bold">{mileage.toLocaleString("fr-MA")} km</span>
              <span className="text-white/30 font-normal ml-2 text-xs">
                (normal pour {year} : {((2026 - year) * 20000).toLocaleString("fr-MA")} km)
              </span>
            </label>
            <input
              type="range" min={0} max={350000} step={5000} value={mileage}
              onChange={(e) => { setMileage(Number(e.target.value)); setResult(null); }}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1"><span>0 km</span><span>350 000 km</span></div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">État général</label>
            <div className="space-y-2">
              {Object.entries(CONDITIONS).map(([key, val]) => (
                <label key={key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${condition === key ? "border-orange-500/50 bg-orange-500/10" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"}`}>
                  <input type="radio" name="condition" value={key} checked={condition === key} onChange={() => { setCondition(key); setResult(null); }} className="accent-orange-500" />
                  <span className="text-sm text-white/80">{val.label}</span>
                </label>
              ))}
            </div>
          </div>

          {attempted && (!brand || !model) && (
            <p className="text-red-400 text-xs">Sélectionnez une marque et un modèle pour continuer.</p>
          )}

          <button
            onClick={handleEstimate}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" /> Estimer le prix
          </button>
        </div>

        {/* Result */}
        {result && result.mid > 0 && (
          <div className="mt-6 bg-gradient-to-br from-orange-500/15 to-orange-500/5 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest">Estimation Sou9Car — {brand} {model} {year}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center bg-white/[0.03] rounded-xl py-3">
                <p className="text-white/40 text-xs mb-1 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" /> Bas du marché</p>
                <p className="text-white font-bold text-lg">{formatDH(result.min)}</p>
              </div>
              <div className="text-center bg-orange-500/10 border border-orange-500/25 rounded-xl py-3">
                <p className="text-orange-400 text-xs mb-1 flex items-center justify-center gap-1"><Minus className="w-3 h-3" /> Prix estimé</p>
                <p className="text-orange-400 font-extrabold text-2xl">{formatDH(result.mid)}</p>
              </div>
              <div className="text-center bg-white/[0.03] rounded-xl py-3">
                <p className="text-white/40 text-xs mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> Haut du marché</p>
                <p className="text-white font-bold text-lg">{formatDH(result.max)}</p>
              </div>
            </div>

            <div className="bg-white/[0.04] rounded-xl p-3 mb-5 flex items-start gap-2">
              <Info className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-white/45 text-xs leading-relaxed">
                Basé sur le marché marocain 2026 pour un {brand} {model} {year} avec {mileage.toLocaleString("fr-MA")} km.
                {mileage > (2026 - year) * 20000
                  ? ` Kilométrage élevé (${((mileage - (2026 - year) * 20000) / 1000).toFixed(0)}k km de plus que la moyenne) — prix réduit en conséquence.`
                  : mileage < (2026 - year) * 20000
                  ? ` Kilométrage faible — légère plus-value appliquée.`
                  : " Kilométrage dans la normale pour l'année."}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link href="/listings/create" className="flex-1 text-center py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                Vendre ma voiture <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href={`/listings?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`} className="flex-1 text-center py-2.5 border border-orange-500/30 text-orange-400 font-bold rounded-xl text-sm hover:bg-orange-500/10 transition-colors">
                Comparer sur le marché
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
          <p className="text-white/45 text-xs leading-relaxed">
            <strong className="text-white/65">Méthodologie :</strong> Les prix sont calculés à partir des prix neufs au Maroc en 2024,
            avec une dépréciation annuelle réaliste par modèle, ajustée selon le kilométrage (base 20 000 km/an) et l&apos;état général.
            Pour une expertise certifiée, demandez une <Link href="/inspections" className="text-orange-400 hover:underline">inspection professionnelle Sou9Car</Link>.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
