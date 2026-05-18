export type ProgressStage = {
  stage: string;
  message: string;
  timestamp: string;
  source: "stream" | "client";
};

export type Evaluation = {
  citation_score: number;
  duplicate_score: number;
  source_diversity: number;
  completeness_score: number;
  grounding_score: number;
  overall_score: number;
  hallucination_risk: "low" | "medium" | "high";
};

export type Metrics = {
  totalCost: number;
  totalTokens: number;
  extractionCalls: number;
  embeddingCalls: number;
};

export type HistoryItem = {
  id: string;
  query: string;
  report: string;
  createdAt: string;
  updatedAt?: string;
};

export type ResearchJobResponse = {
  success: boolean;
  cached?: boolean;
  jobId: string | null;
  result?: ResearchResult | null;
};

export type ResearchJobState =
  | "idle"
  | "submitting"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type ResearchResult = {
  report: string;
  evaluation: Evaluation | null;
};

export type ResearchStatusResponse = {
  id: string;
  state?: string;
  result?: unknown;
  failedReason?: string | null;
};
