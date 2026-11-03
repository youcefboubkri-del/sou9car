// Kept in sync with the web app (src/lib/utils.ts, listings/create/page.tsx).
// Values are the DB enum strings; labels are French UI text.

export type Option = { label: string; value: string };

export const CAR_BRANDS = [
  "Abarth", "Alfa Romeo", "Audi", "BMW", "BYD", "Bentley", "Bugatti",
  "Chevrolet", "Chrysler", "Citroën", "Cupra", "Dacia", "Daewoo",
  "DFSK", "DS", "Ferrari", "Fiat", "Ford", "Geely", "GMC", "Honda",
  "Hyundai", "Infiniti", "Isuzu", "Iveco", "JAC", "Jaguar", "Jeep",
  "Kia", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lotus",
  "MG", "Mahindra", "Maserati", "Mazda", "McLaren", "Mercedes",
  "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Polestar",
  "Porsche", "RAM", "Renault", "Rolls-Royce", "SEAT", "Skoda",
  "Smart", "SsangYong", "Subaru", "Suzuki", "Tesla", "Toyota",
  "Volkswagen", "Volvo", "Xiaomi", "Zeekr",
];

export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
  "Safi", "El Jadida", "Beni Mellal", "Témara", "Settat",
  "Laâyoune", "Khouribga", "Nador", "Taza", "Mohammedia",
];

export const FUEL_TYPES: Option[] = [
  { label: "Diesel", value: "DIESEL" },
  { label: "Essence", value: "GASOLINE" },
  { label: "Hybride", value: "HYBRID" },
  { label: "Électrique", value: "ELECTRIC" },
  { label: "GPL", value: "LPG" },
];

export const TRANSMISSIONS: Option[] = [
  { label: "Manuelle", value: "MANUAL" },
  { label: "Automatique", value: "AUTOMATIC" },
];

export const BODY_TYPES: Option[] = [
  { label: "SUV", value: "SUV" },
  { label: "Berline", value: "SEDAN" },
  { label: "Citadine", value: "HATCHBACK" },
  { label: "Coupé", value: "COUPE" },
  { label: "Break", value: "BREAK" },
  { label: "Cabriolet", value: "CABRIOLET" },
  { label: "Monospace", value: "MINIVAN" },
  { label: "Pick-up", value: "PICKUP" },
  { label: "Utilitaire", value: "VAN" },
];

export const CONDITIONS: Option[] = [
  { label: "Excellent", value: "EXCELLENT" },
  { label: "Bon état", value: "GOOD" },
  { label: "État correct", value: "FAIR" },
  { label: "Mauvais état", value: "POOR" },
];

export const DRIVE_TYPES: Option[] = [
  { label: "Traction (FWD)", value: "FWD" },
  { label: "Propulsion (RWD)", value: "RWD" },
  { label: "Intégrale (AWD)", value: "AWD" },
  { label: "4×4 (4WD)", value: "4WD" },
];

export const AIR_CONDITIONING: Option[] = [
  { label: "Sans", value: "NONE" },
  { label: "Manuelle", value: "MANUAL" },
  { label: "Automatique", value: "AUTO" },
  { label: "Double zone", value: "DUAL_ZONE" },
  { label: "Multi-zones", value: "MULTI_ZONE" },
];

export const SORT_OPTIONS: Option[] = [
  { label: "Plus récentes", value: "newest" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Année (récente)", value: "year_desc" },
  { label: "Kilométrage (bas)", value: "mileage_asc" },
];

export function labelOf(options: Option[], value: string | null | undefined) {
  if (!value) return undefined;
  return options.find((o) => o.value === value)?.label ?? value;
}

// Platform WhatsApp contact (same default as the web's NEXT_PUBLIC_PLATFORM_PHONE).
export const PLATFORM_PHONE = process.env.EXPO_PUBLIC_PLATFORM_PHONE || "0777874495";
