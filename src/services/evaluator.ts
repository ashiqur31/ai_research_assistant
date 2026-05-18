import { ResearchData } from "../types/research";
import { EvaluationResult } from "../types/evaluation";

export function evaluateResearch(data: ResearchData): EvaluationResult {
  const citation_score = calculateCitationScore(data);
  const duplicate_score = calculateDuplicateScore(data);
  const source_diversity = calculateSourceDiversity(data);
  const completeness_score = calculateCompletenessScore(data);
  const grounding_score = calculateGroundingScore(data);
  const hallucination_risk = calculateHallucinationRisk(
    grounding_score,
    citation_score,
  );
  const overall_score = Number(
    (
      (citation_score +
        source_diversity +
        completeness_score +
        grounding_score) /
      4
    ).toFixed(2),
  );

  return {
    citation_score,
    duplicate_score,
    source_diversity,
    completeness_score,
    grounding_score,
    hallucination_risk,
    overall_score,
  };
}

function calculateCitationScore(data: ResearchData) {
  const allEvidence = [...data.claims, ...data.quotes, ...data.statistics];

  if (allEvidence.length === 0) {
    return 0;
  }

  const cited = allEvidence.filter(
    (item) => item.source && item.source.startsWith("http"),
  ).length;

  return Number((cited / allEvidence.length).toFixed(2));
}

function calculateDuplicateScore(data: ResearchData) {
  const claims = data.claims.map((claim) => claim.text.toLowerCase());
  const unique = new Set(claims);
  const duplicates = claims.length - unique.size;

  if (claims.length === 0) {
    return 0;
  }

  return Number((duplicates / claims.length).toFixed(2));
}

function calculateSourceDiversity(data: ResearchData) {
  const urls = [...data.claims, ...data.quotes, ...data.statistics].map(
    (item) => item.source,
  );

  if (urls.length === 0) {
    return 0;
  }

  const domains = new Set(
    urls
      .map((url) => {
        try {
          return new URL(url).hostname;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );

  return Number((domains.size / urls.length).toFixed(2));
}

function calculateCompletenessScore(data: ResearchData) {
  let score = 0;

  if (data.claims.length > 0) score += 0.4;
  if (data.quotes.length > 0) score += 0.3;
  if (data.statistics.length > 0) score += 0.3;

  return Number(score.toFixed(2));
}

function calculateGroundingScore(data: ResearchData) {
  const allEvidence = [...data.claims, ...data.quotes, ...data.statistics];

  if (allEvidence.length === 0) {
    return 0;
  }

  const grounded = allEvidence.filter(
    (item) => item.source && item.title && item.text.length > 20,
  ).length;

  return Number((grounded / allEvidence.length).toFixed(2));
}

function calculateHallucinationRisk(
  groundingScore: number,
  citationScore: number,
): "low" | "medium" | "high" {
  const average = (groundingScore + citationScore) / 2;

  if (average >= 0.8) return "low";
  if (average >= 0.5) return "medium";
  return "high";
}
