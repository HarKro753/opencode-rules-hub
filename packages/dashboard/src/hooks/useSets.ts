"use client";

import { useState, useEffect, useCallback } from "react";
import type { RuleSetInfo } from "@/utils/api";
import { fetchSets } from "@/utils/api";

export function useSets() {
  const [sets, setSets] = useState<RuleSetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSets();
      setSets(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load rule sets";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { sets, loading, error, reload: load };
}
