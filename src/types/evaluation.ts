export type EvaluationResult = {
  citation_score: number;
  duplicate_score: number;
  source_diversity: number;
  completeness_score: number;
  grounding_score: number;
  hallucination_risk: "low" | "medium" | "high";
  overall_score: number;
};
