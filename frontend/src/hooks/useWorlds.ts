import { useEffect, useState } from "react";
import { World } from "../types/world";
import { fetchPublicWorlds } from "../lib/api";

interface UseWorldsResult {
  worlds: World[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetches the active, ordered world collection from the backend.
 * This is the single source of truth the spatial UI (Phase 2+) will
 * drive its carousel and dock from — no world-specific logic here.
 */
export function useWorlds(): UseWorldsResult {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPublicWorlds()
      .then((data) => {
        if (!cancelled) setWorlds(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { worlds, isLoading, error };
}
