import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

type Result<T> = { path: string | null; data: T | null; error: string | null };

// Small fetch hook: loading/error/refresh state for one GET endpoint.
// Pass path = null to skip (e.g. while logged out).
// `loading` is derived: true until a response for the *current* path has landed.
export function useApi<T>(path: string | null) {
  const [result, setResult] = useState<Result<T>>({ path: null, data: null, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    (mode: "initial" | "refresh" | "silent") => {
      if (!path) return Promise.resolve();
      const id = ++requestId.current;
      return api<T>(path)
        .then((data) => {
          if (id === requestId.current) setResult({ path, data, error: null });
        })
        .catch((e: Error) => {
          if (id !== requestId.current) return;
          // Background refreshes keep showing stale data, unless nothing has loaded yet.
          setResult((r) =>
            mode === "silent" && r.path === path ? r : { path, data: r.path === path ? r.data : null, error: e.message }
          );
        })
        .finally(() => {
          if (mode === "refresh") setRefreshing(false);
        });
    },
    [path]
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const current = result.path === path;
  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: !!path && !current,
    refreshing,
    setData: (data: T) => setResult({ path, data, error: null }),
    reload: () => {
      setResult({ path: null, data: null, error: null });
      void load("initial");
    },
    refresh: () => {
      setRefreshing(true);
      void load("refresh");
    },
    silentRefresh: () => load("silent"),
  };
}
