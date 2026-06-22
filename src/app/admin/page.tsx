"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { formatPrice, timeAgo } from "@/lib/utils";
import {
  Users, Car, TrendingUp, Heart, MessageCircle, BarChart2,
  Loader2, Trash2, Eye, CheckCircle, XCircle, Shield,
  Mail, Phone, MapPin, RefreshCw, MessagesSquare, X, Star,
  CalendarDays, BadgeCheck, ShieldAlert, CalendarCheck, Clock
} from "lucide-react";

type Tab = "overview" | "users" | "listings" | "messages" | "reservations";

const PLAN_COLORS: Record<string, string> = {
  FREE: "bg-white/[0.06] text-white/60",
  PRO: "bg-orange-500/15 text-orange-300",
  PREMIUM: "bg-purple-500/15 text-purple-300",
  ENTERPRISE: "bg-blue-500/15 text-blue-300",
};

function UserDetailModal({ userId, onClose, onUpdate }: { userId: string; onClose: () => void; onUpdate: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(d => { setUser(d.user); setLoading(false); });
  }, [userId]);

  const save = async (field: string, value: string) => {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    setSaving(false);
    onUpdate();
    setUser((u: any) => ({ ...u, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-lg bg-surface shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.04]">
          <h2 className="font-bold text-lg" style={{color:'#ffffff'}}>Détails utilisateur</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center text-white/40">Utilisateur introuvable</div>
        ) : (
          <div className="flex-1 p-6 space-y-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{color:'#ffffff'}}>{user.name}</h3>
                <p className="text-sm" style={{color:'rgba(255,255,255,0.5)'}}>{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[user.role] ?? 'bg-white/[0.06] text-white/60'}`}>{user.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PLAN_COLORS[user.subscriptionPlan ?? 'FREE'] ?? 'bg-white/[0.06] text-white/60'}`}>
                    {user.subscriptionPlan ?? 'FREE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Annonces', value: user._count?.listings ?? 0, icon: Car },
                { label: 'Messages', value: user._count?.sentMessages ?? 0, icon: MessageCircle },
                { label: 'Favoris', value: user._count?.favorites ?? 0, icon: Heart },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold" style={{color:'#ffffff'}}>{s.value}</p>
                  <p className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Info fields */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{color:'rgba(255,255,255,0.4)'}}>Informations du compte</h4>
              {[
                { label: 'Téléphone', value: user.phone ?? '—', icon: Phone },
                { label: 'Ville', value: user.city ?? '—', icon: MapPin },
                { label: 'Inscrit le', value: new Date(user.createdAt).toLocaleDateString('fr-MA', { day:'2-digit', month:'short', year:'numeric' }), icon: CalendarDays },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 py-2 border-b border-white/[0.06]">
                  <f.icon className="w-4 h-4 flex-shrink-0" style={{color:'rgba(255,255,255,0.4)'}} />
                  <span className="w-20 text-xs font-semibold" style={{color:'rgba(255,255,255,0.5)'}}>{f.label}</span>
                  <span className="text-sm" style={{color:'#ffffff'}}>{f.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 py-2 border-b border-white/[0.06]">
                <Mail className="w-4 h-4 flex-shrink-0" style={{color:'rgba(255,255,255,0.4)'}} />
                <span className="w-20 text-xs font-semibold" style={{color:'rgba(255,255,255,0.5)'}}>Email</span>
                <span className="text-sm flex items-center gap-1" style={{color:'#ffffff'}}>
                  {user.emailVerified
                    ? <><BadgeCheck className="w-4 h-4 text-emerald-500" /> Vérifié</>
                    : <><ShieldAlert className="w-4 h-4 text-amber-500" /> Non vérifié</>}
                </span>
              </div>
              {user.sellerVerification && (
                <div className="flex items-center gap-3 py-2 border-b border-white/[0.06]">
                  <Shield className="w-4 h-4 flex-shrink-0" style={{color:'rgba(255,255,255,0.4)'}} />
                  <span className="w-20 text-xs font-semibold" style={{color:'rgba(255,255,255,0.5)'}}>ID vendeur</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    user.sellerVerification.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-300' :
                    user.sellerVerification.status === 'PENDING' ? 'bg-amber-500/15 text-amber-300' : 'bg-red-500/15 text-red-300'
                  }`}>{user.sellerVerification.status}</span>
                </div>
              )}
            </div>

            {/* Subscription edit */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{color:'rgba(255,255,255,0.4)'}}>Abonnement</h4>
              <div className="flex items-center gap-3">
                <select
                  value={user.subscriptionPlan ?? 'FREE'}
                  onChange={e => save('subscriptionPlan', e.target.value)}
                  className="flex-1 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  style={{color:'#ffffff'}}
                >
                  {['FREE','PRO','PREMIUM','ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {saving && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
              </div>
              {user.subscriptionExpiry && (
                <p className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>Expire le : {new Date(user.subscriptionExpiry).toLocaleDateString("fr-MA")}</p>
              )}
            </div>

            {/* Role edit */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{color:'rgba(255,255,255,0.4)'}}>Rôle</h4>
              <select
                value={user.role}
                onChange={e => save('role', e.target.value)}
                className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                style={{color:'#ffffff'}}
              >
                {['BUYER','SELLER','INSPECTOR','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Recent listings */}
            {user.listings?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{color:'rgba(255,255,255,0.4)'}}>Annonces récentes</h4>
                <div className="space-y-2">
                  {user.listings.map((l: any) => (
                    <Link key={l.id} href={`/listings/${l.id}`} target="_blank"
                      className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors">
                      <div>
                        <p className="text-sm font-semibold" style={{color:'#ffffff'}}>{l.brand} {l.model}</p>
                        <p className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>{l.views ?? 0} vues · {timeAgo(new Date(l.createdAt))}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{color:'#ffffff'}}>{formatPrice(l.price)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[l.status]}`}>{{ACTIVE:"ACTIF",PENDING:"EN ATTENTE",SOLD:"VENDU",HIDDEN:"MASQUÉ",REJECTED:"REJETÉ"}[l.status] ?? l.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300",
  PENDING: "bg-amber-500/15 text-amber-300",
  SOLD: "bg-blue-500/15 text-blue-300",
  HIDDEN: "bg-white/[0.06] text-white/50",
  REJECTED: "bg-red-500/15 text-red-300",
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-500/15 text-purple-300",
  SELLER: "bg-orange-500/15 text-orange-300",
  BUYER: "bg-blue-500/15 text-blue-300",
  INSPECTOR: "bg-green-500/15 text-green-300",
};

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [resLoading, setResLoading] = useState(false);

  const loadReservations = useCallback(() => {
    setResLoading(true);
    fetch("/api/reservations?role=seller")
      .then(r => r.json())
      .then(d => setReservations(d.reservations ?? []))
      .finally(() => setResLoading(false));
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/full")
      .then(r => { if (r.status === 403) { router.push("/"); return null; } return r.json(); })
      .then(d => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => { loadData(); loadReservations(); }, [loadData, loadReservations]);

  const deleteItem = async (type: string, id: string) => {
    if (!confirm(`Supprimer cet élément (${type}) ?`)) return;
    setActionLoading(id);
    await fetch("/api/admin/full", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id }) });
    setActionLoading(null);
    loadData();
  };

  const updateListing = async (id: string, status: string) => {
    setActionLoading(id);
    await fetch("/api/admin/full", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "listing", id, data: { status } }) });
    setActionLoading(null);
    loadData();
  };

  const handleReservation = async (id: string, action: "confirm" | "reject") => {
    setActionLoading(id);
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setActionLoading(null);
    loadReservations();
  };

  const updateUser = async (id: string, role: string) => {
    setActionLoading(id);
    await fetch("/api/admin/full", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "user", id, data: { role } }) });
    setActionLoading(null);
    loadData();
  };

  if (loading && !data) return (
    <MainLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    </MainLayout>
  );

  if (!data) return <MainLayout><div className="text-center py-24 text-white/50">Accès refusé.</div></MainLayout>;

  const { stats, recentUsers, recentListings, recentMessages, recentConversations } = data;

  const filteredUsers = recentUsers?.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  ) || [];

  const filteredListings = recentListings?.filter((l: any) =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.brand?.toLowerCase().includes(search.toLowerCase()) ||
    l.seller?.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const pendingRes = reservations.filter(r => r.status === "PENDING");

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart2 },
    { id: "users", label: "Utilisateurs", icon: Users, count: stats.totalUsers },
    { id: "listings", label: "Annonces", icon: Car, count: stats.totalListings },
    { id: "messages", label: "Messages", icon: MessageCircle, count: stats.totalMessages },
    { id: "reservations", label: "Réservations", icon: CalendarCheck, count: pendingRes.length },
  ];

  return (
    <MainLayout>
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={loadData}
        />
      )}
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-orange-500 text-xs font-bold uppercase tracking-widest block mb-1">Sou9Car</span>
            <h1 className="text-2xl font-bold text-white">Panneau d&apos;administration</h1>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 text-white/60 hover:text-white text-sm border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface border-b border-white/[0.08] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? "border-orange-500 text-orange-400" : "border-transparent text-white/50 hover:text-white/90"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count !== undefined && (
                <span className="bg-white/[0.06] text-white/60 text-xs px-1.5 py-0.5 rounded-full font-semibold">{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Utilisateurs", value: stats.totalUsers, color: "bg-blue-500/10 text-blue-400", sub: "comptes enregistrés" },
                { icon: Car, label: "Annonces actives", value: stats.activeListings, color: "bg-orange-500/10 text-orange-400", sub: `${stats.totalListings} total` },
                { icon: TrendingUp, label: "Voitures vendues", value: stats.soldListings, color: "bg-emerald-500/10 text-emerald-400", sub: "ventes finalisées" },
                { icon: MessageCircle, label: "Messages", value: stats.totalMessages, color: "bg-purple-500/10 text-purple-400", sub: `${stats.totalConversations} conversations` },
              ].map((s, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-white/[0.08] p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-extrabold text-white">{s.value.toLocaleString()}</p>
                  <p className="text-sm font-semibold text-white/75 mt-0.5">{s.label}</p>
                  <p className="text-xs text-white/40">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent signups */}
              <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" />Nouvelles inscriptions</h2>
                  <button onClick={() => setTab("users")} className="text-xs text-orange-500 hover:underline">Tout voir →</button>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {recentUsers?.slice(0, 8).map((u: any) => (
                    <div key={u.id} onClick={() => setSelectedUserId(u.id)} className="flex items-center gap-3 px-6 py-3 hover:bg-orange-500/10 cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                        <p className="text-xs text-white/40 truncate">{u.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] ?? "bg-white/[0.06] text-white/50"}`}>{u.role}</span>
                        <p className="text-xs text-white/40 mt-0.5">{timeAgo(new Date(u.createdAt))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent listings */}
              <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="font-bold text-white flex items-center gap-2"><Car className="w-4 h-4 text-orange-500" />Annonces récentes</h2>
                  <button onClick={() => setTab("listings")} className="text-xs text-orange-500 hover:underline">Tout voir →</button>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {recentListings?.slice(0, 8).map((l: any) => (
                    <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.04] transition-colors">
                      <div className="w-12 h-9 rounded-lg bg-white/[0.06] overflow-hidden flex-shrink-0">
                        {l.thumbnail
                          ? <img src={l.thumbnail} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-white/20" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{l.brand} {l.model}</p>
                        <p className="text-xs text-white/40">{l.seller?.name} · {timeAgo(new Date(l.createdAt))}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-white">{formatPrice(l.price)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[l.status]}`}>{{ACTIVE:"ACTIF",PENDING:"EN ATTENTE",SOLD:"VENDU",HIDDEN:"MASQUÉ",REJECTED:"REJETÉ"}[l.status] ?? l.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent conversations */}
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="font-bold text-white flex items-center gap-2"><MessagesSquare className="w-4 h-4 text-orange-500" />Conversations récentes</h2>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {recentConversations?.slice(0, 8).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {c.buyer?.name} → {c.seller?.name}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {'Message direct'} ·{' '}
                        {c.messages?.[0]?.content?.substring(0, 60) || 'Aucun message'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs bg-white/[0.06] text-white/60 px-2 py-0.5 rounded-full">{c.messages?.length ?? 0} msg</span>
                      <p className="text-xs text-white/40 mt-0.5">{timeAgo(new Date(c.createdAt))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text" placeholder="Rechercher par nom, email ou téléphone…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                style={{color:'#ffffff'}}
              />
              <span className="text-sm text-white/50">{filteredUsers.length} utilisateurs</span>
            </div>
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Inscrit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} onClick={() => setSelectedUserId(u.id)} className="hover:bg-orange-500/10 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{u.name}</p>
                              {u.city && <p className="text-xs text-white/40 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{u.city}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white/75 flex items-center gap-1"><Mail className="w-3 h-3 text-white/40" />{u.email}</p>
                          {u.phone && <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-white/40" />{u.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={e => updateUser(u.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${ROLE_COLORS[u.role] ?? "bg-white/[0.06] text-white/50"}`}
                            style={{color: 'inherit'}}
                          >
                            {["BUYER","SELLER","INSPECTOR","ADMIN"].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white/50 text-xs">{timeAgo(new Date(u.createdAt))}</p>
                          {u.emailVerified && <span className="text-xs text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />Vérifié</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteItem("user", u.id)}
                            disabled={actionLoading === u.id}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {tab === "listings" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text" placeholder="Rechercher des annonces…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                style={{color:'#ffffff'}}
              />
              <span className="text-sm text-white/50">{filteredListings.length} annonces</span>
            </div>
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Voiture</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Vendeur</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Vues</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredListings.map((l: any) => (
                      <tr key={l.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg bg-white/[0.06] overflow-hidden flex-shrink-0">
                              {l.thumbnail
                                ? <img src={l.thumbnail} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-white/20" /></div>}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{l.brand} {l.model} {l.year}</p>
                              <p className="text-xs text-white/40">{l.city} · {timeAgo(new Date(l.createdAt))}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white/75">{l.seller?.name}</p>
                          <p className="text-xs text-white/40">{l.seller?.email}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-white">{formatPrice(l.price)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={l.status}
                            onChange={e => updateListing(l.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[l.status] ?? "bg-white/[0.06] text-white/50"}`}
                          >
                            {["ACTIVE","PENDING","SOLD","HIDDEN","REJECTED"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-white/50">{l.views?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/listings/${l.id}`} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => deleteItem("listing", l.id)}
                              disabled={actionLoading === l.id}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                              {actionLoading === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <div className="space-y-6">
            {/* Conversations */}
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08]">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 text-orange-500" />
                  Toutes les conversations ({recentConversations?.length})
                </h2>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {recentConversations?.map((c: any) => (
                  <div key={c.id} className="px-6 py-4 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{c.buyer?.name}</span>
                          <span className="text-white/40 text-xs">→</span>
                          <span className="text-sm font-semibold text-white">{c.seller?.name}</span>
                        </div>
                        {c.listingId && (
                          <p className="text-xs text-orange-400 font-medium mb-1">Annonce #{c.listingId.substring(0,8)}</p>
                        )}
                        <p className="text-xs text-white/50 truncate">
                          {c.messages?.[0]?.content || 'Aucun message pour l\'instant'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-semibold">{c.messages?.length ?? 0} msg</span>
                        <p className="text-xs text-white/40 mt-1">{timeAgo(new Date(c.createdAt))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual messages */}
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.08]">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-orange-500" />
                  Messages récents ({stats.totalMessages})
                </h2>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {recentMessages?.map((m: any) => (
                  <div key={m.id} className="px-6 py-3.5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-blue-400">{m.sender?.name}</span>
                          <span className="text-white/30 text-xs">→</span>
                          <span className="text-xs font-semibold text-white/60">{m.receiver?.name}</span>
                        </div>
                        <p className="text-sm text-white/90">{m.content}</p>
                      </div>
                      <p className="text-xs text-white/40 flex-shrink-0">{timeAgo(new Date(m.createdAt))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESERVATIONS ── */}
        {tab === "reservations" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-lg">Demandes de disponibilité</h2>
                <p className="text-white/40 text-sm mt-0.5">Confirmez ou rejetez les demandes des acheteurs</p>
              </div>
              <button onClick={loadReservations} className="flex items-center gap-2 text-white/60 hover:text-white text-sm border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <RefreshCw className={`w-4 h-4 ${resLoading ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>

            {/* Pending */}
            {pendingRes.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-amber-500/20 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white">En attente de réponse <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingRes.length}</span></h3>
                </div>
                <div className="divide-y divide-amber-500/10">
                  {pendingRes.map((r: any) => (
                    <div key={r.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-white">{r.listing.brand} {r.listing.model} {r.listing.year}</p>
                        <p className="text-sm text-white/60 mt-0.5">{r.listing.city}</p>
                        <div className="mt-2 space-y-0.5">
                          <p className="text-xs text-white/50"><span className="text-amber-300 font-semibold">{r.buyer.name}</span> · {r.buyer.email}</p>
                          {r.buyer.phone && <p className="text-xs text-white/50">📞 {r.buyer.phone}</p>}
                          <p className="text-xs text-white/30 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> Expire : {new Date(r.expiresAt).toLocaleString("fr-MA")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReservation(r.id, "confirm")}
                          disabled={actionLoading === r.id}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Confirmer
                        </button>
                        <button
                          onClick={() => handleReservation(r.id, "reject")}
                          disabled={actionLoading === r.id}
                          className="flex items-center gap-1.5 px-5 py-2.5 bg-white/[0.06] hover:bg-red-500/20 text-white/60 hover:text-red-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Rejeter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All reservations history */}
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.08]">
                <h3 className="font-bold text-white">Historique complet <span className="text-white/40 font-normal text-sm ml-1">({reservations.length})</span></h3>
              </div>
              {resLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
              ) : reservations.length === 0 ? (
                <div className="py-12 text-center text-white/40">
                  <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-white/20" />
                  <p>Aucune demande de réservation</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {reservations.map((r: any) => {
                    const statusColors: Record<string, string> = {
                      PENDING: "bg-amber-500/15 text-amber-300",
                      CONFIRMED: "bg-blue-500/15 text-blue-300",
                      REJECTED: "bg-red-500/15 text-red-300",
                      EXPIRED: "bg-white/[0.06] text-white/40",
                      PAID: "bg-emerald-500/15 text-emerald-300",
                    };
                    return (
                      <div key={r.id} className="px-5 py-3.5 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{r.listing.brand} {r.listing.model} {r.listing.year}</p>
                          <p className="text-xs text-white/40">{r.buyer.name} · {r.buyer.email} · {new Date(r.createdAt).toLocaleDateString("fr-MA")}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusColors[r.status] ?? "bg-white/[0.06] text-white/40"}`}>
                          {r.status}
                        </span>
                        {r.status === "PENDING" && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleReservation(r.id, "confirm")} disabled={actionLoading === r.id} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">
                              {actionLoading === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "✓"}
                            </button>
                            <button onClick={() => handleReservation(r.id, "reject")} disabled={actionLoading === r.id} className="px-3 py-1.5 bg-white/[0.06] hover:bg-red-500/20 text-white/60 rounded-lg text-xs font-bold">
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
