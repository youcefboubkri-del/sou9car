import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError, loadToken, saveToken } from "./api";
import type { User } from "./types";

type RegisterInput = { name: string; email: string; password: string; phone?: string; city?: string };

type AuthState = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api<{ user: User }>("/api/auth/me");
      setUser(user);
    } catch (e) {
      // Only drop the session if the server rejected it, not on network errors.
      if (e instanceof ApiError && e.status === 401) {
        await saveToken(null);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (await loadToken()) await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const handleAuth = useCallback(
    async (path: string, body: unknown) => {
      const res = await api<{ user: User; token?: string }>(path, { method: "POST", body });
      if (!res.token) throw new Error("Le serveur n'a pas renvoyé de session. Mettez à jour le backend.");
      await saveToken(res.token);
      setUser(res.user);
      void refresh(); // pull full profile (phone, city…)
    },
    [refresh]
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      ready,
      refresh,
      login: (email, password) => handleAuth("/api/auth/login", { email: email.trim().toLowerCase(), password }),
      register: (input) =>
        handleAuth("/api/auth/register", { ...input, email: input.email.trim().toLowerCase() }),
      logout: async () => {
        await saveToken(null);
        setUser(null);
      },
    }),
    [user, ready, refresh, handleAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
