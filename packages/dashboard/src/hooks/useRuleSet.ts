"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSet } from "@/utils/api";

export function useRuleSet(name: string) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSet(name);
      setContent(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load rule set";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    load();
  }, [load]);

  return { content, loading, error, reload: load };
}
