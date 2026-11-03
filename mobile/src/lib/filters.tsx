import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Filters = {
  q: string;
  brand: string;
  city: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  maxMileage: string;
  sort: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  brand: "",
  city: "",
  fuelType: "",
  transmission: "",
  bodyType: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  maxMileage: "",
  sort: "newest",
};

// Number of filters set, not counting free-text search and sort.
export function activeFilterCount(f: Filters) {
  return (Object.keys(f) as (keyof Filters)[]).filter((k) => k !== "q" && k !== "sort" && f[k] !== "").length;
}

export function filtersToQuery(f: Filters, page: number, limit = 12) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  for (const [k, v] of Object.entries(f)) {
    const value = v.trim();
    if (value && !(k === "sort" && value === "newest")) params.set(k, value);
  }
  return params.toString();
}

const FiltersContext = createContext<{ filters: Filters; setFilters: (f: Filters) => void } | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const value = useMemo(() => ({ filters, setFilters }), [filters]);
  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error("useFilters must be used inside FiltersProvider");
  return ctx;
}
