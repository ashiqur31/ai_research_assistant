import { RESEARCH_ENDPOINT } from "@/constants/constants";
import type {
  HistoryItem,
  Metrics,
  ResearchJobResponse,
  ResearchResult,
  ResearchStatusResponse,
} from "@/types/research";

async function parseApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: unknown };

    if (typeof body.error === "string" && body.error.trim()) {
      return body.error;
    }
  } catch {
    // Fall back to the status text below.
  }

  return response.statusText || "Request failed.";
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as T;
}

function isEvaluation(value: unknown): value is ResearchResult["evaluation"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "citation_score" in value && "hallucination_risk" in value;
}

export async function createResearchJob(query: string) {
  return fetchJson<ResearchJobResponse>(RESEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
}

export async function getResearchJob(jobId: string) {
  return fetchJson<ResearchStatusResponse>(
    `${RESEARCH_ENDPOINT}/${encodeURIComponent(jobId)}`,
    {
      cache: "no-store",
    },
  );
}

export async function getResearchHistory() {
  return fetchJson<HistoryItem[]>(`${RESEARCH_ENDPOINT}/history`, {
    cache: "no-store",
  });
}

export async function getResearchMetrics() {
  return fetchJson<Metrics>(`${RESEARCH_ENDPOINT}/metrics`, {
    cache: "no-store",
  });
}

export function getResearchStreamUrl(jobId: string) {
  return `${RESEARCH_ENDPOINT}/${encodeURIComponent(jobId)}/stream`;
}

export function normalizeResearchResult(result: unknown): ResearchResult | null {
  if (!result || typeof result !== "object") {
    return null;
  }

  const record = result as Record<string, unknown>;
  const report = typeof record.report === "string" ? record.report : "";

  if (!report) {
    return null;
  }

  return {
    report,
    evaluation: isEvaluation(record.evaluation) ? record.evaluation : null,
  };
}
