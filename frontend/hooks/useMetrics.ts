"use client";

import { useCallback, useEffect, useState } from "react";
import { getResearchMetrics } from "@/services/api";
import type { Metrics } from "@/types/research";

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await getResearchMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Metrics fetch failed:", err);
      setError("Could not load metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshMetrics();
    }, 0);

    const interval = window.setInterval(refreshMetrics, 15000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(interval);
    };
  }, [refreshMetrics]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
  };
}
