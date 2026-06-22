"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { ClipboardCheck, MapPin, Calendar, Phone, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Inspection {
  id: string;
  status: string;
  location: string | null;
  scheduledAt: string | null;
  notes: string | null;
  price: number;
  createdAt: string;
  listing: { id: string; brand: string; model: string; year: number; city: string };
  buyer: { name: string; phone: string | null };
  inspector: { name: string } | null;
}

interface Inspector {
  id: string;
  name: string;
  email: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  CONFIRMED: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  IN_PROGRESS: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  COMPLETED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  CANCELLED: "bg-white/[0.06] text-white/50 border-white/10",
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: "Confirmer",
  CONFIRMED: "Démarrer l'inspection",
  IN_PROGRESS: "Marquer comme terminé",
};

export default function InspectorPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push("/login"); return; }
        if (d.user.role !== "ADMIN" && d.user.role !== "INSPECTOR") { router.push("/"); return; }
        setRole(d.user.role);
      });

    fetch("/api/inspections")
      .then((r) => r.json())
      .then((d) => setInspections(d.inspections ?? []))
      .finally(() => setLoading(false));

    // Load inspectors list (admin only)
    fetch("/api/admin/inspectors")
      .then((r) => r.ok ? r.json() : { inspectors: [] })
      .then((d) => setInspectors(d.inspectors ?? []))
      .catch(() => {});
  }, [router]);

  async function updateStatus(id: string, status: string, inspectorId?: string) {
    setUpdating(id);
    await fetch(`/api/inspections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(inspectorId && { inspectorId }) }),
    });
    const d = await fetch("/api/inspections").then((r) => r.json());
    setInspections(d.inspections ?? []);
    setUpdating(null);
  }

  async function assignInspector(id: string, inspectorId: string) {
    setUpdating(id);
    await fetch(`/api/inspections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inspectorId }),
    });
    const d = await fetch("/api/inspections").then((r) => r.json());
    setInspections(d.inspections ?? []);
    setUpdating(null);
  }

  const pending = inspections.filter((i) => i.status === "PENDING");
  const active = inspections.filter((i) => ["CONFIRMED", "IN_PROGRESS"].includes(i.status));
  const done = inspections.filter((i) => ["COMPLETED", "CANCELLED"].includes(i.status));

  return (
    <MainLayout>
      <div className="bg-[#0a0a0a] border-b border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1 block">
            {role === "ADMIN" ? "Admin" : "Inspector"}
          </span>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-orange-400" /> Tableau de bord inspections
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-white/25" />
            <p className="font-medium">Aucune inspection pour l&apos;instant</p>
            <p className="text-sm mt-1">Les réservations des acheteurs apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-10">
            {[
              { label: "Nouvelles demandes", items: pending, icon: AlertCircle, iconColor: "text-amber-500" },
              { label: "En cours", items: active, icon: Clock, iconColor: "text-blue-400" },
              { label: "Terminées", items: done, icon: CheckCircle, iconColor: "text-emerald-500" },
            ].map(({ label, items, icon: Icon, iconColor }) => items.length > 0 && (
              <div key={label}>
                <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${iconColor}`} /> {label} ({items.length})
                </h2>
                <div className="space-y-4">
                  {items.map((ins, i) => (
                    <motion.div
                      key={ins.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-white">
                              {ins.listing.brand} {ins.listing.model} {ins.listing.year}
                            </h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${STATUS_COLORS[ins.status] ?? ""}`}>
                              {{PENDING:"EN ATTENTE",CONFIRMED:"CONFIRMÉ",IN_PROGRESS:"EN COURS",COMPLETED:"TERMINÉ",CANCELLED:"ANNULÉ"}[ins.status] ?? ins.status}
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 text-sm text-white/50">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {ins.location ?? ins.listing.city}
                            </span>
                            {ins.scheduledAt && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                {new Date(ins.scheduledAt).toLocaleString("fr-MA")}
                              </span>
                            )}
                            {ins.buyer.phone && (
                              <a href={`tel:${ins.buyer.phone}`} className="flex items-center gap-1.5 text-orange-500 hover:underline">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                {ins.buyer.phone}
                              </a>
                            )}
                          </div>

                          {ins.notes && (
                            <p className="text-sm text-white/40 mt-2 italic">"{ins.notes}"</p>
                          )}

                          {ins.inspector && (
                            <p className="text-xs text-white/40 mt-2">
                              Inspecteur : <span className="font-semibold text-white/60">{ins.inspector.name}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <p className="font-bold text-white">{ins.price} MAD</p>

                          {/* Assign inspector (admin only) */}
                          {role === "ADMIN" && !ins.inspector && inspectors.length > 0 && (
                            <select
                              className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-surface"
                              defaultValue=""
                              onChange={(e) => { if (e.target.value) assignInspector(ins.id, e.target.value); }}
                            >
                              <option value="">Assigner un inspecteur</option>
                              {inspectors.map((insp) => (
                                <option key={insp.id} value={insp.id}>{insp.name}</option>
                              ))}
                            </select>
                          )}

                          {/* Status action button */}
                          {NEXT_STATUS[ins.status] && (
                            <button
                              onClick={() => updateStatus(ins.id, NEXT_STATUS[ins.status])}
                              disabled={updating === ins.id}
                              className="text-sm bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              {updating === ins.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                              {NEXT_LABEL[ins.status]}
                            </button>
                          )}

                          {ins.status !== "CANCELLED" && ins.status !== "COMPLETED" && (
                            <button
                              onClick={() => updateStatus(ins.id, "CANCELLED")}
                              disabled={updating === ins.id}
                              className="text-xs text-red-400 hover:text-red-400 transition-colors"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
