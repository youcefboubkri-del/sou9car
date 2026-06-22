"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";
import { Bell, Plus, Trash2, ChevronDown, LogIn } from "lucide-react";

interface Alert {
  id: string;
  brand: string | null;
  model: string | null;
  city: string | null;
  maxPrice: number;
  minYear: number | null;
  fuelType: string | null;
  createdAt: string;
}

const BRANDS = ["Dacia", "Renault", "Toyota", "Hyundai", "Volkswagen", "Peugeot", "Citroën", "Mercedes-Benz", "BMW", "Ford", "Kia", "Fiat"];
const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan"];
const FUELS = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ brand: "", model: "", city: "", maxPrice: "", minYear: "", fuelType: "" });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.user) {
          setAuthed(true);
          return fetch("/api/alerts").then((r) => r.json()).then((d) => setAlerts(d.alerts ?? []));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.maxPrice) return;
    setSaving(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: form.brand || null,
          model: form.model || null,
          city: form.city || null,
          maxPrice: Number(form.maxPrice),
          minYear: form.minYear ? Number(form.minYear) : null,
          fuelType: form.fuelType || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts((prev) => [data.alert, ...prev]);
        setForm({ brand: "", model: "", city: "", maxPrice: "", minYear: "", fuelType: "" });
        setShowForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
        </div>
      </MainLayout>
    );
  }

  if (!authed) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Bell className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Alertes prix</h1>
          <p className="text-white/50 mb-6">Connectez-vous pour recevoir une alerte dès qu'une voiture correspond à vos critères.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors">
            <LogIn className="w-4 h-4" /> Se connecter
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-10 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Mes alertes</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-400" /> Alertes prix
            </h1>
            <p className="text-white/40 mt-1 text-sm">Recevez un email dès qu'une voiture correspond à vos critères.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouvelle alerte
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-4 py-3 rounded-xl">
            Alerte créée — vous serez notifié par email dès qu'une correspondance est trouvée.
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-bold">Nouvelle alerte</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Marque</label>
                <div className="relative">
                  <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50">
                    <option value="">Toutes</option>
                    {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Ville</label>
                <div className="relative">
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50">
                    <option value="">Toutes</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Prix max (DH) *</label>
                <input
                  type="number" required value={form.maxPrice}
                  onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                  placeholder="ex: 80000"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Année min</label>
                <input
                  type="number" value={form.minYear} min={2000} max={2025}
                  onChange={(e) => setForm({ ...form, minYear: e.target.value })}
                  placeholder="ex: 2018"
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-white/50 mb-1 block">Carburant</label>
                <div className="relative">
                  <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                    className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50">
                    <option value="">Tous</option>
                    {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving || !form.maxPrice}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors">
                {saving ? "Création..." : "Créer l'alerte"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-white/10 text-white/50 hover:text-white rounded-xl text-sm transition-colors">
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Alert list */}
        {alerts.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Aucune alerte pour l&apos;instant.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-orange-400 text-sm hover:underline">
              Créer votre première alerte
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <p className="text-white font-semibold text-sm">
                      {alert.brand ?? "Toutes marques"} {alert.model} — max {alert.maxPrice.toLocaleString("fr-MA")} DH
                    </p>
                  </div>
                  <div className="flex gap-3 mt-1.5 flex-wrap">
                    {alert.city && <span className="text-xs text-white/40">{alert.city}</span>}
                    {alert.minYear && <span className="text-xs text-white/40">≥ {alert.minYear}</span>}
                    {alert.fuelType && <span className="text-xs text-white/40">{alert.fuelType}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(alert.id)}
                  className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
