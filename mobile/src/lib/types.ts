export type UserRole = "BUYER" | "SELLER" | "INSPECTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface SellerSummary {
  id: string;
  name: string;
  city: string | null;
  avatarUrl: string | null;
}

export type ListingStatus = "ACTIVE" | "PENDING" | "SOLD" | "HIDDEN" | "REJECTED";

export interface ListingCard {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  city: string;
  status: ListingStatus;
  isFeatured: boolean;
  creditEnabled: boolean;
  views: number;
  createdAt: string;
  thumbnail: string | null;
  seller: SellerSummary;
}

export interface ListingDetail extends Omit<ListingCard, "thumbnail" | "seller"> {
  description: string;
  color: string | null;
  interior: string | null;
  engineSize: string | null;
  power: string | null;
  performanceHp: number | null;
  driveType: string | null;
  fuelConsumption: string | null;
  doors: number | null;
  seats: number | null;
  condition: string | null;
  firstRegistration: string | null;
  numberOfOwners: number | null;
  airConditioning: string | null;
  isVintage: boolean;
  isImport: boolean;
  isDamaged: boolean;
  hasWarranty: boolean;
  creditDownPayment: number | null;
  creditMonths: number | null;
  creditInterestRate: number | null;
  sellerId: string;
  images: { id: string; url: string; order: number }[];
  seller: SellerSummary & {
    phone: string | null;
    createdAt: string;
    sellerVerification: { status: string } | null;
  };
  vehicleHistory: {
    vinNumber: string;
    previousOwners: number | null;
    mileageVerified: boolean;
    importedFrom: string | null;
    customsCleared: boolean | null;
  } | null;
  _count: { favorites: number };
}

export interface ListingsResponse {
  listings: ListingCard[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ConversationSummary {
  id: string;
  listingId: string | null;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  buyer: Participant;
  seller: Participant;
  messages: Message[];
  unreadCount: number;
}

export interface ConversationDetail {
  conversation: Omit<ConversationSummary, "unreadCount">;
  listing: { id: string; brand: string; model: string; year: number; price: number; city: string } | null;
}
