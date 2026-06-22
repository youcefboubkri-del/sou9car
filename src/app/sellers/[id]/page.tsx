"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { CarCard } from "@/components/listings/car-card";
import { Shield, MapPin, Car, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

interface Seller {
  id: string;
  name: string;
  city: string | null;
  createdAt: string;
  sellerVerification: { status: string } | null;
  _count: { listings: number };
}

interface Listing {
  id: string; title: string; brand: string; model: string;
  year: number; mileage: number; price: number; fuelType: string;
  transmission: string; bodyType: string; city: string;
  thumbnail: string | null; createdAt: string;
}

export default function SellerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sellers/${id}`)
      .then((r) => r.json())
      .then((d) => { setSeller(d.seller); setListings(d.listings ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : !seller ? (
          <div className="text-center py-24">
            <h2 className="text-xl font-bold text-white/90 mb-2">Vendeur introuvable</h2>
            <Link href="/listings" className="text-orange-500 hover:underline">Parcourir les voitures</Link>
          </div>
        ) : (
          <>
            {/* Seller card */}
            <div className="bg-surface rounded-2xl border border-white/[0.08] shadow-sm p-8 mb-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-500/20">
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">{seller.name}</h1>
                    {seller.sellerVerification?.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded-full">
                        <Shield className="w-3 h-3" /> Vérifié
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-white/40">
                    {seller.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {seller.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> {seller._count.listings} annonce{seller._count.listings !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Membre depuis {new Date(seller.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Listings */}
            {listings.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Car className="w-12 h-12 mx-auto mb-3 text-white/25" />
                <p className="font-medium">Aucune annonce active</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-white mb-5">Annonces actives ({listings.length})</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {listings.map((l, i) => (
                    <CarCard key={l.id} listing={l} index={i} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
