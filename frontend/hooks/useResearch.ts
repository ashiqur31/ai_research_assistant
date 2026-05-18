"use client";

import { useEffect, useRef, useState } from "react";
import {
  createResearchJob,
  getResearchHistory,
  getResearchJob,
  normalizeResearchResult,
} from "@/services/api";
import type {
  Evaluation,
  HistoryItem,
  ResearchJobState,
} from "@/types/research";

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

function findMatchingHistoryItem(history: HistoryItem[], query: string) {
  const normalized = normalizeQuery(query);

  return history.find((item) => normalizeQuery(item.query) === normalized) ?? null;
}

export function useResearch() {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<ResearchJobState>("idle");
  const [currentQuery, setCurrentQuery] = useState("");
  const [report, setReport] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<number | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function openHistoryItem(item: HistoryItem) {
    stopPolling();
    setJobId(null);
    setLoading(false);
    setSelectedHistoryItem(item);
    setCurrentQuery(item.query);
    setReport(item.report);
    setEvaluation(null);
    setJobState("completed");
    setError(null);
  }

  async function tryLoadFromHistory(query: string) {
    const history = await getResearchHistory();
    const match = findMatchingHistoryItem(history, query);

    if (!match) {
      return false;
    }

    setSelectedHistoryItem(match);
    setReport(match.report);
    setEvaluation(null);
    setJobState("completed");
    setLoading(false);
    stopPolling();
    return true;
  }

  async function startResearch(query: string) {
    try {
      stopPolling();
      setLoading(true);
      setError(null);
      setJobId(null);
      setSelectedHistoryItem(null);
      setReport("");
      setEvaluation(null);
      setCurrentQuery(query);
      setJobState("submitting");

      const data = await createResearchJob(query);

      if (data.cached && data.result?.report) {
        setJobId(null);
        setReport(data.result.report);
        setEvaluation(data.result.evaluation);
        setJobState("completed");
        return;
      }

      if (!data.jobId) {
        throw new Error("Backend did not return a job id.");
      }

      const nextJobId = data.jobId;

      setJobId(nextJobId);
      setJobState("queued");

      pollRef.current = window.setInterval(async () => {
        try {
          const status = await getResearchJob(nextJobId);
          const normalizedResult = normalizeResearchResult(status.result);

          if (normalizedResult?.report) {
            setReport(normalizedResult.report);
            setEvaluation(normalizedResult.evaluation);
            setJobState("completed");
            setLoading(false);
            stopPolling();
            return;
          }

          if (status.state === "completed") {
            const restored = await tryLoadFromHistory(query);

            if (!restored) {
              setJobState("failed");
              setLoading(false);
              setError("Research completed but no report was returned.");
              stopPolling();
            }

            return;
          }

          if (status.state === "failed") {
            setJobState("failed");
            setLoading(false);
            setError(status.failedReason ?? "Research job failed before a report was produced.");
            stopPolling();
            return;
          }

          setJobState("processing");
        } catch (pollError) {
          console.error("Research status polling failed:", pollError);

          try {
            const restored = await tryLoadFromHistory(query);

            if (!restored) {
              setJobState("processing");
            }
          } catch (historyError) {
            console.error("History fallback failed:", historyError);
            setJobState("processing");
          }
        }
      }, 4000);
    } catch (err) {
      console.error("Research failed:", err);
      setError("Could not start research.");
      setJobState("failed");
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return {
    loading,
    jobId,
    jobState,
    currentQuery,
    report,
    evaluation,
    selectedHistoryItem,
    error,
    startResearch,
    openHistoryItem,
  };
}
