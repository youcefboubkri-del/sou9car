import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "MAD") {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(km: number) {
  return new Intl.NumberFormat("fr-MA").format(km) + " km";
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function timeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString("fr-MA");
}

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

export const FUEL_TYPES = [
  { label: "Diesel", value: "DIESEL" },
  { label: "Essence", value: "GASOLINE" },
  { label: "Hybride", value: "HYBRID" },
  { label: "Électrique", value: "ELECTRIC" },
  { label: "GPL", value: "LPG" },
];

export const TRANSMISSIONS = [
  { label: "Manuelle", value: "MANUAL" },
  { label: "Automatique", value: "AUTOMATIC" },
];

export const BODY_TYPES = [
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

export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
  "Safi", "El Jadida", "Beni Mellal", "Témara", "Settat",
  "Laâyoune", "Khouribga", "Nador", "Taza", "Mohammedia",
];
