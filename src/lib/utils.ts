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

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
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
  "Diesel", "Gasoline", "Electric", "Hybrid", "Plug-in Hybrid",
];

export const TRANSMISSIONS = ["Manual", "Automatic"];

export const BODY_TYPES = [
  "SUV", "Sedan", "Hatchback", "Coupe", "Convertible",
  "Pickup", "Minivan", "Station Wagon", "Off-road", "Van",
];

export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
  "Safi", "El Jadida", "Beni Mellal", "Témara", "Settat",
  "Laâyoune", "Khouribga", "Nador", "Taza", "Mohammedia",
];
