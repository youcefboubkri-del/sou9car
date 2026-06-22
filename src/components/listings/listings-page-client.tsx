"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { CarCard } from "@/components/listings/car-card";
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, MOROCCAN_CITIES } from "@/lib/utils";

const CITY_DISPLAY: Record<string, string> = {
  "Casablanca": "Casablanca — الدار البيضاء",
  "Rabat": "Rabat — الرباط",
  "Marrakech": "Marrakech — مراكش",
  "Fès": "Fès — فاس",
  "Tanger": "Tanger — طنجة",
  "Agadir": "Agadir — أكادير",
  "Meknès": "Meknès — مكناس",
  "Oujda": "Oujda — وجدة",
  "Kénitra": "Kénitra — القنيطرة",
  "Tétouan": "Tétouan — تطوان",
  "Safi": "Safi — آسفي",
  "El Jadida": "El Jadida — الجديدة",
  "Beni Mellal": "Beni Mellal — بني ملال",
  "Témara": "Témara — تمارة",
  "Settat": "Settat — سطات",
  "Laâyoune": "Laâyoune — العيون",
  "Khouribga": "Khouribga — خريبكة",
  "Nador": "Nador — الناظور",
  "Taza": "Taza — تازة",
  "Mohammedia": "Mohammedia — المحمدية",
};
import { useT } from "@/lib/i18n";

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
  status: string;
  seller: {
    id: string;
    name: string;
    city: string | null;
  };
}

export function ListingsPageClient() {
  const searchParams = useSearchParams();
  const { t } = useT();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minYear: searchParams.get("minYear") || "",
    maxYear: searchParams.get("maxYear") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    bodyType: searchParams.get("bodyType") || "",
    city: searchParams.get("city") || "",
    sort: searchParams.get("sort") || "newest",
  });

  useEffect(() => {
    fetchListings();
  }, [page, filters]);

  async function fetchListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters({
      q: "", brand: "", minPrice: "", maxPrice: "",
      minYear: "", maxYear: "", fuelType: "", transmission: "",
      bodyType: "", city: "", sort: "newest",
    });
    setPage(1);
  }

  function hasActiveFilters() {
    return Object.entries(filters).some(([key, val]) => key !== "sort" && val);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder={t.filter_search_placeholder}
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {t.filter_filters}
          {hasActiveFilters() && (
            <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {Object.entries(filters).filter(([k, v]) => k !== "sort" && v).length}
            </span>
          )}
        </button>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface"
        >
          <option value="newest">{t.filter_sort_newest}</option>
          <option value="price_asc">{t.filter_sort_price_asc}</option>
          <option value="price_desc">{t.filter_sort_price_desc}</option>
          <option value="year_desc">{t.filter_sort_year_desc}</option>
          <option value="year_asc">{t.filter_sort_year_asc}</option>
          <option value="mileage_asc">{t.filter_sort_mileage_asc}</option>
          <option value="mileage_desc">{t.filter_sort_mileage_desc}</option>
        </select>
      </div>

      {showFilters && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t.filter_filters}</h3>
            {hasActiveFilters() && (
              <button onClick={clearFilters} className="text-sm text-primary flex items-center gap-1 hover:underline">
                <X className="w-4 h-4" />
                {t.filter_clear}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_brand}</label>
              <select value={filters.brand} onChange={(e) => updateFilter("brand", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface">
                <option value="">{t.all_brands}</option>
                {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_body}</label>
              <select value={filters.bodyType} onChange={(e) => updateFilter("bodyType", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface">
                <option value="">{t.filter_all_types}</option>
                {BODY_TYPES.map((t2) => <option key={t2.value} value={t2.value}>{t2.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_fuel}</label>
              <select value={filters.fuelType} onChange={(e) => updateFilter("fuelType", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface">
                <option value="">{t.filter_all_fuels_short}</option>
                {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_transmission}</label>
              <select value={filters.transmission} onChange={(e) => updateFilter("transmission", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface">
                <option value="">{t.filter_all}</option>
                {TRANSMISSIONS.map((tr) => <option key={tr.value} value={tr.value}>{tr.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_city}</label>
              <select value={filters.city} onChange={(e) => updateFilter("city", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface">
                <option value="">{t.all_cities}</option>
                {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{CITY_DISPLAY[c] ?? c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_price_min} (MAD)</label>
              <input type="number" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} placeholder={t.filter_price_min_placeholder} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_price_max} (MAD)</label>
              <input type="number" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} placeholder={t.filter_price_max_placeholder} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_year_min}</label>
              <input type="number" value={filters.minYear} onChange={(e) => updateFilter("minYear", e.target.value)} placeholder="2020" className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">{t.filter_year_max}</label>
              <input type="number" value={filters.maxYear} onChange={(e) => updateFilter("maxYear", e.target.value)} placeholder="2026" className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="h-48 bg-white/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-4 bg-white/10 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t.no_results}</h3>
          <p className="text-muted">{t.no_results_desc}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-4">{total} {t.results_found}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <CarCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>

          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-white/[0.04]"
              >
                {t.prev}
              </button>
              <span className="text-sm text-muted px-4">
                {t.page_of} {page} {t.page_on} {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-white/[0.04]"
              >
                {t.next}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
