import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

type FavoritesState = {
  ids: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  version: number; // bumps on every change so lists can refetch
};

const FavoritesContext = createContext<FavoritesState | null>(null);
const EMPTY = new Set<string>();

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // IDs are tagged with the user they belong to, so logging out/in never shows stale hearts.
  const [state, setState] = useState<{ userId: string | null; ids: Set<string> }>({ userId: null, ids: EMPTY });
  const [version, setVersion] = useState(0);
  const ids = state.userId === userId ? state.ids : EMPTY;

  useEffect(() => {
    if (!userId) return;
    api<{ favorites: string[] }>("/api/favorites")
      .then((r) => setState({ userId, ids: new Set(r.favorites) }))
      .catch(() => {});
  }, [userId]);

  const setOne = useCallback(
    (id: string, on: boolean) => {
      setState((prev) => {
        const base = prev.userId === userId ? prev.ids : EMPTY;
        if (base.has(id) === on) return prev;
        const next = new Set(base);
        if (on) next.add(id);
        else next.delete(id);
        return { userId, ids: next };
      });
    },
    [userId]
  );

  const toggle = useCallback(
    async (id: string) => {
      // Optimistic update, rolled back if the request fails.
      const wasFav = ids.has(id);
      setOne(id, !wasFav);
      try {
        const { favorited } = await api<{ favorited: boolean }>(`/api/favorites/${id}`, { method: "POST" });
        setOne(id, favorited);
        setVersion((v) => v + 1);
      } catch (e) {
        setOne(id, wasFav);
        throw e;
      }
    },
    [ids, setOne]
  );

  const value = useMemo(
    () => ({ ids, version, toggle, isFavorite: (id: string) => ids.has(id) }),
    [ids, version, toggle]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
