"use client";

import { useCallback, useEffect, useState } from "react";
import { getResearchHistory } from "@/services/api";
import type { HistoryItem } from "@/types/research";

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    try {
      setError(null);
      const data = await getResearchHistory();
      setHistory(data);
    } catch (err) {
      console.error("History fetch failed:", err);
      setError("Could not load research history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory,
  };
}
