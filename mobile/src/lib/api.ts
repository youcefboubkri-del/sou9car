import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Backend base URL. Override for local dev with EXPO_PUBLIC_API_URL
// (e.g. http://192.168.1.20:3002 — use your machine's LAN IP, not localhost, on a phone).
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  "https://sou9car.ma"
).replace(/\/$/, "");

const TOKEN_KEY = "sou9car_session";
let memoryToken: string | null = null;

// SecureStore is not available on web; fall back to localStorage there.
export async function loadToken() {
  if (Platform.OS === "web") {
    memoryToken = globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  } else {
    memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return memoryToken;
}

export async function saveToken(token: string | null) {
  memoryToken = token;
  if (Platform.OS === "web") {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "x-sou9car-client": "mobile",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Connexion impossible. Vérifiez votre réseau.", 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || `Erreur ${res.status}`, res.status);
  }
  return data as T;
}

// Mirrors the web's proxyImg(): relative paths and data URIs load directly,
// external URLs go through /api/img to get around hotlink protection.
export function imageUrl(url: string | null | undefined) {
  if (!url) return undefined;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/api/img?url=${encodeURIComponent(url)}`;
}
