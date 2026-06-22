"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { CarCard } from "@/components/listings/car-card";
import { Heart, Search } from "lucide-react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  city: string;
  thumbnail: string | null;
  createdAt: string;
}

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) { setAuthed(false); setLoading(false); return; }

        const favRes = await fetch("/api/favorites");
        const { favorites } = await favRes.json() as { favorites: string[] };

        if (!favorites.length) { setLoading(false); return; }

        const listingData = await Promise.all(
          favorites.map((id) => fetch(`/api/listings/${id}`).then((r) => r.json()).catch(() => null))
        );
        setListings(listingData.filter(Boolean).map((d) => d.listing));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Voitures sauvegardées</h1>
            <p className="text-white/50 text-sm mt-0.5">Vos annonces favorites, toutes au même endroit</p>
          </div>
        </div>

        {!authed ? (
          <div className="text-center py-24">
            <Heart className="w-14 h-14 text-white/25 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white/90 mb-2">Connectez-vous pour voir vos voitures sauvegardées</h2>
            <p className="text-white/40 mb-6">Créez un compte pour sauvegarder des voitures et y accéder depuis n&apos;importe où.</p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Se connecter
            </Link>
          </div>
        ) : loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/[0.06] overflow-hidden animate-pulse">
                <div className="h-52 bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-5 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-14 h-14 text-white/25 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white/90 mb-2">Aucune voiture sauvegardée</h2>
            <p className="text-white/40 mb-6">Appuyez sur l&apos;icône cœur sur n&apos;importe quelle annonce pour la sauvegarder ici.</p>
            <Link href="/listings" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <Search className="w-4 h-4" /> Parcourir les voitures
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/40 mb-6">{listings.length} voiture{listings.length !== 1 ? "s" : ""} sauvegardée{listings.length !== 1 ? "s" : ""}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing, i) => (
                <CarCard key={listing.id} listing={{ ...listing, isFavorited: true }} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
