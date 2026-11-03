const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatPrice(price: number) {
  return `${nf.format(price)} DH`;
}

export function formatMileage(km: number) {
  return `${nf.format(km)} km`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours} h`;
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function clockTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Moroccan local number (06…, 07…) -> international digits for wa.me / tel.
export function toInternational(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) return `212${digits.slice(1)}`;
  return digits;
}
