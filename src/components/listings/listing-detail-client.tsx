"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Gauge, Fuel, Phone, Shield, ChevronLeft, ChevronRight, Heart, Share2, AlertTriangle, MessageCircle, Car, CalendarCheck, Clock, CheckCircle, XCircle, Lock, Star } from "lucide-react";
import { formatPrice, formatMileage, cn } from "@/lib/utils";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string | null;
  colorManufacturer: string | null;
  interior: string | null;
  engineSize: string | null;
  engineDisplacement: number | null;
  power: string | null;
  performanceKw: number | null;
  performanceHp: number | null;
  driveType: string | null;
  fuelConsumption: string | null;
  co2Emissions: number | null;
  doors: number | null;
  seats: number | null;
  cylinders: number | null;
  tankSize: number | null;
  condition: string | null;
  series: string | null;
  equipmentLine: string | null;
  firstRegistration: string | null;
  numberOfOwners: number | null;
  huStatus: string | null;
  airConditioning: string | null;
  parkingAssistance: string | null;
  airbags: string | null;
  brakedTrailerLoad: number | null;
  unbrakedTowingCapacity: number | null;
  vehicleWeight: number | null;
  lastMaintenanceDate: string | null;
  lastServiceKm: number | null;
  city: string;
  isVintage: boolean;
  isImport: boolean;
  isDamaged: boolean;
  hasWarranty: boolean;
  creditEnabled: boolean;
  creditDownPayment: number | null;
  creditMonths: number | null;
  creditInterestRate: number | null;
  status: string;
  views: number;
  createdAt: string;
  images: { id: string; url: string; order: number }[];
  seller: {
    id: string;
    name: string;
    phone: string | null;
    city: string | null;
    avatarUrl: string | null;
    createdAt: string;
    sellerVerification: { status: string } | null;
  };
  vehicleHistory: {
    vinNumber: string;
    registrationNumber: string | null;
    previousOwners: number | null;
    mileageVerified: boolean;
    importedFrom: string | null;
    customsCleared: boolean | null;
    hasLien: boolean;
    theftRecord: boolean;
  } | null;
  _count: { favorites: number };
}

function calcMonthly(price: number, down: number, months: number, annualRate: number) {
  const principal = price - down;
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  return Math.round(principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

function CreditWidget({ price, defaultDown, months, interestRate }: {
  price: number; defaultDown: number; months: number; interestRate: number;
}) {
  const [down, setDown] = useState(defaultDown);
  const monthly = calcMonthly(price, down, months, interestRate);
  const total = down + monthly * months;
  const maxDown = Math.round(price * 0.8);

  return (
    <div className="bg-purple-500/10 border border-purple-500/25 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">💳</span>
        <h4 className="font-bold text-white text-sm">Paiement en crédit disponible</h4>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/[0.04] rounded-xl py-3">
          <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Mensualité</p>
          <p className="text-white font-extrabold text-xl">{monthly.toLocaleString("fr-MA")}</p>
          <p className="text-white/30 text-[10px]">DH/mois</p>
        </div>
        <div className="bg-white/[0.04] rounded-xl py-3">
          <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Durée</p>
          <p className="text-white font-bold text-lg">{months}</p>
          <p className="text-white/30 text-[10px]">mois</p>
        </div>
        <div className="bg-white/[0.04] rounded-xl py-3">
          <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Total payé</p>
          <p className="text-white font-bold text-base">{(total / 1000).toFixed(0)}k</p>
          <p className="text-white/30 text-[10px]">DH</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-white/50">Apport initial</span>
          <span className="text-purple-300 font-bold">{down.toLocaleString("fr-MA")} DH</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxDown}
          step={1000}
          value={down}
          onChange={(e) => setDown(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="flex justify-between text-[10px] text-white/25 mt-1">
          <span>0 DH</span>
          <span>Ajustez l&apos;apport</span>
          <span>{maxDown.toLocaleString("fr-MA")} DH</span>
        </div>
      </div>

      {interestRate > 0 && (
        <p className="text-white/30 text-[10px]">Taux d&apos;intérêt annuel : {interestRate}%</p>
      )}
    </div>
  );
}

export function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [resLoading, setResLoading] = useState(false);
  const [resError, setResError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<{ id: string; status: string; expiresAt: string } | null>(null);
  const [resCountdown, setResCountdown] = useState("");
  const [hasCompletedEscrow, setHasCompletedEscrow] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Load existing reservation for this listing (include PAID so phone unlocks)
  useEffect(() => {
    fetch(`/api/reservations?role=buyer&listingId=${id}`)
      .then((r) => r.json())
      .then((d) => {
        const active = (d.reservations ?? []).find((r: { status: string }) =>
          ["PENDING", "CONFIRMED", "PAID"].includes(r.status)
        );
        if (active) setReservation(active);
      })
      .catch(() => {});
  }, [id]);

  // Check if buyer has a completed escrow for this listing (unlocks reviews)
  useEffect(() => {
    fetch("/api/escrow")
      .then((r) => r.json())
      .then((d) => {
        const released = (d.escrows ?? []).some(
          (e: { listingId: string; status: string }) =>
            e.listingId === id && e.status === "RELEASED"
        );
        setHasCompletedEscrow(released);
      })
      .catch(() => {});
  }, [id]);

  // Live countdown for pending reservation
  useEffect(() => {
    if (!reservation || reservation.status !== "PENDING") return;
    function tick() {
      const diff = new Date(reservation!.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setResCountdown("Expiré"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setResCountdown(`${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [reservation]);

  const requestReservation = useCallback(async () => {
    if (!listing || resLoading) return;
    setResLoading(true);
    setResError(null);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setReservation(data.reservation);
      } else if (data?.reservation) {
        setReservation(data.reservation);
      } else {
        setResError(data?.error ?? "Impossible d'envoyer la demande. Réessayez.");
      }
    } catch {
      setResError("Erreur réseau — vérifiez votre connexion.");
    } finally {
      setResLoading(false);
    }
  }, [listing, id, resLoading, router]);

  const startConversation = useCallback(async () => {
    if (!listing || msgLoading) return;
    setMsgLoading(true);
    setMsgError(null);
    try {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: listing.seller.id, listingId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/messages/${data.conversation.id}`);
      } else {
        const err = await res.json().catch(() => null);
        setMsgError(
          err?.error === "Cannot message yourself"
            ? "C'est votre propre annonce — les acheteurs verront le bouton Message ici."
            : err?.error ?? "Impossible de démarrer la conversation. Réessayez."
        );
      }
    } catch {
      setMsgError("Erreur réseau — vérifiez votre connexion et réessayez.");
    } finally {
      setMsgLoading(false);
    }
  }, [listing, id, msgLoading, router]);

  const toggleFavorite = useCallback(async () => {
    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await fetch(`/api/favorites/${id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
      }
    } finally {
      setFavLoading(false);
    }
  }, [id, favLoading]);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setListing(data.listing);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => { if (d.favorites?.includes(id)) setFavorited(true); })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMyId(d?.user?.id ?? null))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="h-96 bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-6 bg-white/10 rounded w-1/2" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
            <div className="h-48 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Annonce introuvable</h2>
        <p className="text-muted mb-4">Cette annonce a peut-être été supprimée ou n&apos;existe pas.</p>
        <Link href="/listings" className="text-primary hover:underline">Parcourir toutes les voitures</Link>
      </div>
    );
  }

  const imgs = listing.images.length > 0 ? listing.images : [{ id: "none", url: "", order: 0 }];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Retour aux annonces
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl overflow-hidden bg-white/[0.06]">
            {listing.images.length > 0 ? (
              <img src={imgs[currentImage].url} alt={listing.title} className="w-full h-80 md:h-96 object-cover" />
            ) : (
              <div className="w-full h-80 md:h-96 flex items-center justify-center"><Car className="w-20 h-20 text-white/15" /></div>
            )}
            {imgs.length > 1 && (
              <>
                <button onClick={() => setCurrentImage((p) => (p - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentImage((p) => (p + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imgs.map((_, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={cn("w-2 h-2 rounded-full transition-colors", i === currentImage ? "bg-surface" : "bg-white/50")} />
                  ))}
                </div>
              </>
            )}
          </div>

          {imgs.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {imgs.map((img, i) => (
                <button key={img.id} onClick={() => setCurrentImage(i)} className={cn("flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors", i === currentImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Full Specs Table */}
          <div className="mt-8 bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border" style={{backgroundColor:'rgba(255,255,255,0.04)'}}>
              <h2 className="text-lg font-semibold" style={{color:'#ffffff'}}>Détails du véhicule</h2>
            </div>
            <div className="divide-y divide-border text-sm">
              {[
                { label: "État du véhicule", value: listing.condition },
                { label: "Carrosserie", value: listing.bodyType },
                { label: "Série", value: listing.series },
                { label: "Ligne d'équipement", value: listing.equipmentLine },
                { label: "Première immatriculation", value: listing.firstRegistration },
                { label: "Kilométrage", value: listing.mileage ? `${listing.mileage.toLocaleString()} km` : null },
                { label: "Nombre de propriétaires", value: listing.numberOfOwners },
                { label: "Contrôle technique", value: listing.huStatus },
                { label: "Transmission", value: listing.transmission },
                { label: "Type de traction", value: listing.driveType },
                { label: "Carburant", value: listing.fuelType },
                { label: "Cylindrée", value: listing.engineDisplacement ? `${listing.engineDisplacement.toLocaleString()} cm³` : null },
                { label: "Puissance", value: listing.performanceKw && listing.performanceHp ? `${listing.performanceKw} kW (${listing.performanceHp} hp)` : null },
                { label: "Cylindres", value: listing.cylinders },
                { label: "Consommation (mixte)", value: listing.fuelConsumption },
                { label: "Émissions CO₂", value: listing.co2Emissions ? `${listing.co2Emissions} g/km` : null },
                { label: "Capacité du réservoir", value: listing.tankSize ? `${listing.tankSize} l` : null },
                { label: "Nombre de places", value: listing.seats },
                { label: "Nombre de portes", value: listing.doors },
                { label: "Climatisation", value: listing.airConditioning },
                { label: "Aide au stationnement", value: listing.parkingAssistance },
                { label: "Airbags", value: listing.airbags },
                { label: "Couleur (constructeur)", value: listing.colorManufacturer },
                { label: "Couleur", value: listing.color },
                { label: "Intérieur", value: listing.interior },
                { label: "Charge remorquable freinée", value: listing.brakedTrailerLoad ? `${listing.brakedTrailerLoad.toLocaleString()} kg` : null },
                { label: "Charge remorquable non freinée", value: listing.unbrakedTowingCapacity ? `${listing.unbrakedTowingCapacity.toLocaleString()} kg` : null },
                { label: "Poids du véhicule", value: listing.vehicleWeight ? `${listing.vehicleWeight.toLocaleString()} kg` : null },
                { label: "Dernier entretien", value: listing.lastMaintenanceDate },
                { label: "Dernier service (km)", value: listing.lastServiceKm ? `${listing.lastServiceKm.toLocaleString()} km` : null },
              ].filter(item => item.value !== null && item.value !== undefined && item.value !== '').map(item => (
                <div key={item.label} className="flex px-6 py-3">
                  <span className="w-1/2 font-medium" style={{color:'rgba(255,255,255,0.5)'}}>{item.label}</span>
                  <span className="w-1/2 font-medium" style={{color:'#ffffff'}}>{String(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {listing.vehicleHistory && (
            <div className="mt-8 bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Rapport d&apos;historique du véhicule
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.vehicleHistory.vinNumber && (
                  <div><span className="text-muted">VIN:</span> <span className="font-mono">{listing.vehicleHistory.vinNumber}</span></div>
                )}
                {listing.vehicleHistory.previousOwners !== null && (
                  <div><span className="text-muted">Propriétaires précédents :</span> {listing.vehicleHistory.previousOwners}</div>
                )}
                {listing.vehicleHistory.mileageVerified && (
                  <div className="text-green-400 font-medium flex items-center gap-1">✓ Kilométrage vérifié</div>
                )}
                {listing.vehicleHistory.importedFrom && (
                  <div><span className="text-muted">Importé de :</span> {listing.vehicleHistory.importedFrom}</div>
                )}
                {listing.vehicleHistory.customsCleared && (
                  <div className="text-green-400 font-medium flex items-center gap-1">✓ Dédouané</div>
                )}
                {listing.vehicleHistory.hasLien && (
                  <div className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Gage actif</div>
                )}
                {listing.vehicleHistory.theftRecord && (
                  <div className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Antécédent de vol</div>
                )}
                {!listing.vehicleHistory.hasLien && !listing.vehicleHistory.theftRecord && (
                  <div className="text-green-400 font-medium flex items-center gap-1">✓ Historique propre</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{listing.brand} {listing.model}</h1>
              <p className="text-3xl font-bold text-primary mt-2">{formatPrice(listing.price)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: Calendar, label: "Année", value: listing.year },
                { icon: Gauge, label: "Kilométrage", value: formatMileage(listing.mileage) },
                { icon: Fuel, label: "Carburant", value: listing.fuelType },
                { label: "Transmission", value: listing.transmission },
                { label: "Carrosserie", value: listing.bodyType },
                ...(listing.color ? [{ label: "Couleur", value: listing.color }] : []),
                ...(listing.engineSize ? [{ label: "Moteur", value: listing.engineSize }] : []),
                ...(listing.power ? [{ label: "Puissance", value: `${listing.power} HP` }] : []),
                ...(listing.doors ? [{ label: "Portes", value: listing.doors }] : []),
                ...(listing.seats ? [{ label: "Places", value: listing.seats }] : []),
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 p-2.5 bg-background rounded-lg">
                  {item.icon && <item.icon className="w-4 h-4 text-muted" />}
                  <div>
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="font-medium text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted" />
              <span>{listing.city}</span>
              <span className="text-muted">·</span>
              <span className="text-muted">{listing.views} vues</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {listing.hasWarranty && <span className="text-xs bg-green-500/15 text-green-300 px-2.5 py-1 rounded-full font-medium">Garantie</span>}
              {listing.isVintage && <span className="text-xs bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full font-medium">Classique</span>}
              {listing.isImport && <span className="text-xs bg-blue-500/15 text-blue-300 px-2.5 py-1 rounded-full font-medium">Importé</span>}
              {listing.creditEnabled && <span className="text-xs bg-purple-500/15 text-purple-300 px-2.5 py-1 rounded-full font-medium">💳 Crédit disponible</span>}
              {listing.seller.sellerVerification?.status === "APPROVED" && (
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Vendeur vérifié
                </span>
              )}
            </div>

            {/* Credit widget */}
            {listing.creditEnabled && listing.creditMonths && listing.creditDownPayment != null && (
              <CreditWidget
                price={listing.price}
                defaultDown={listing.creditDownPayment}
                months={listing.creditMonths}
                interestRate={listing.creditInterestRate ?? 0}
              />
            )}

            <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold">Informations vendeur</h3>
              <Link href={`/sellers/${listing.seller.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {listing.seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-orange-400 hover:underline">{listing.seller.name}</p>
                  {listing.seller.city && <p className="text-xs text-muted">{listing.seller.city}</p>}
                </div>
              </Link>

              {myId === listing.seller.id ? (
                <div className="bg-primary/10 border border-primary/25 rounded-lg px-4 py-3 text-sm text-orange-400">
                  C&apos;est votre annonce. Les acheteurs verront les boutons Message, Email et Téléphone ici.
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={startConversation}
                    disabled={msgLoading}
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                  >
                    {msgLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    Contacter le vendeur
                  </button>
                  {msgError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">{msgError}</p>
                  )}
                  {/* Reservation block */}
                  {!reservation ? (
                    <>
                      <button
                        onClick={requestReservation}
                        disabled={resLoading}
                        className="flex items-center gap-2 w-full px-4 py-2.5 border border-primary/40 bg-primary/5 text-orange-400 rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                      >
                        {resLoading ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                        ) : (
                          <CalendarCheck className="w-4 h-4" />
                        )}
                        Demander la disponibilité
                      </button>
                      <p className="text-[11px] text-white/40 leading-relaxed px-1">
                        Le vendeur a 2h pour confirmer. Après confirmation, vous payez 300 MAD pour réserver le véhicule.
                      </p>
                    </>
                  ) : reservation.status === "PENDING" ? (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-4 py-3 text-sm space-y-1">
                      <div className="flex items-center gap-2 text-amber-300 font-medium">
                        <Clock className="w-4 h-4" /> Demande envoyée
                      </div>
                      <p className="text-white/50 text-xs">Le vendeur a <span className="font-mono text-amber-300">{resCountdown}</span> pour répondre.</p>
                      <Link href="/reservations" className="text-xs text-orange-400 hover:underline">Voir mes réservations →</Link>
                    </div>
                  ) : reservation.status === "CONFIRMED" ? (
                    <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg px-4 py-3 text-sm space-y-2">
                      <div className="flex items-center gap-2 text-blue-300 font-medium">
                        <CheckCircle className="w-4 h-4" /> Disponibilité confirmée
                      </div>
                      <p className="text-white/50 text-xs">Payez 300 MAD pour finaliser votre réservation.</p>
                      <Link href="/reservations" className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors">
                        Payer la réservation →
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white/[0.04] border border-white/10 rounded-lg px-4 py-3 text-sm flex items-center gap-2 text-white/50">
                      <XCircle className="w-4 h-4" />
                      Demande expirée ou rejetée.{" "}
                      <button onClick={() => setReservation(null)} className="text-orange-400 hover:underline ml-1">Réessayer</button>
                    </div>
                  )}
                  {resError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">{resError}</p>
                  )}
                  {/* ── 1. PHONE — locked until 300 MAD paid ── */}
                  {listing.seller.phone && (
                    reservation?.status === "PAID" ? (
                      <button
                        onClick={() => setShowPhone(!showPhone)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-500/10 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {showPhone ? listing.seller.phone : "Afficher le numéro du vendeur"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 w-full px-4 py-3 border border-white/[0.08] bg-white/[0.02] rounded-lg">
                        <Lock className="w-4 h-4 text-white/20 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/50 text-xs font-medium">Numéro masqué</p>
                          <p className="text-white/25 text-[10px] leading-tight mt-0.5">
                            Payez 300 MAD (réservation confirmée) pour débloquer le numéro
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  {/* ── 2. PROTECTION BADGE ── */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <p className="text-emerald-300 font-bold text-[11px]">Via Escrow</p>
                      <p className="text-white/40 text-[10px]">4% · Protégé ✓</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg bg-red-500/8 border border-red-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <p className="text-red-300 font-bold text-[11px]">Hors plateforme</p>
                      <p className="text-white/40 text-[10px]">5% · Non protégé</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${(process.env.NEXT_PUBLIC_PLATFORM_PHONE || "0777874495").replace(/^0/, "212").replace(/[\s\-\+]/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par l'annonce Sou9Car :\n🚗 ${listing.brand} ${listing.model} ${listing.year}\n💰 ${listing.price.toLocaleString("fr-MA")} DH\n📍 ${listing.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg text-sm font-bold transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.118 1.528 5.845L0 24l6.335-1.652A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.376l-.36-.213-3.757.979 1.004-3.653-.234-.376A9.784 9.784 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>
                    Contacter sur WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* ── 3. REVIEW — uniquement après escrow RELEASED ── */}
            {myId && myId !== listing.seller.id && (
              <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-400" />
                  <h3 className="font-semibold text-sm">Laisser un avis vendeur</h3>
                </div>
                {reviewSubmitted ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                    <CheckCircle className="w-4 h-4" /> Avis publié. Merci !
                  </div>
                ) : hasCompletedEscrow ? (
                  <div className="space-y-3">
                    <p className="text-white/40 text-xs">Votre achat via escrow est confirmé — vous pouvez noter ce vendeur.</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-110">
                          <Star className={cn("w-6 h-6", s <= reviewRating ? "fill-orange-400 text-orange-400" : "text-white/20")} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Décrivez votre expérience avec ce vendeur…"
                      rows={3}
                      className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none"
                    />
                    <button
                      disabled={reviewRating === 0 || reviewLoading}
                      onClick={async () => {
                        if (!reviewRating || !listing) return;
                        setReviewLoading(true);
                        await fetch("/api/reviews", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ reviewedId: listing.seller.id, listingId: id, rating: reviewRating, comment: reviewComment }),
                        });
                        setReviewSubmitted(true);
                        setReviewLoading(false);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {reviewLoading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                      Publier l&apos;avis
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <Lock className="w-4 h-4 text-white/20 flex-shrink-0" />
                    <div>
                      <p className="text-white/40 text-xs font-medium">Avis verrouillé</p>
                      <p className="text-white/25 text-[10px] leading-tight mt-0.5">
                        Complétez un achat via <span className="text-orange-400/70">escrow Sou9Car</span> pour noter ce vendeur
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={cn(
                  "flex items-center justify-center gap-2 flex-1 px-4 py-2.5 border rounded-lg text-sm transition-colors",
                  favorited
                    ? "border-red-500/25 bg-red-500/10 text-red-500 hover:bg-red-500/15"
                    : "border-border hover:bg-white/[0.04]"
                )}
              >
                <Heart className={cn("w-4 h-4", favorited && "fill-red-500")} />
                {favorited ? "Sauvegardé" : "Sauvegarder"}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `${listing.brand} ${listing.model} — Sou9Car`, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-white/[0.04] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
            </div>

            {listing.isDamaged && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Véhicule accidenté</p>
                  <p className="text-xs text-amber-300 mt-1">Le vendeur a déclaré que ce véhicule a subi un accident ou des dommages antérieurs. Inspectez soigneusement.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
