import { ResearchData } from "../types/research";
import { EvaluationResult } from "../types/evaluation";
import { analyzeSource } from "./sourceCredibility";

type ReportMetadata = {
  query: string;
  generatedAt: string;
  sourceCount: number;
  processingTimeMs: number;
  estimatedCost: number;
  duplicatesRemoved: number;
  totalTokens: number;
};

type GenerateReportParams = {
  data: ResearchData;
  evaluation: EvaluationResult;
  metadata: ReportMetadata;
};

export function generateMarkdownReport({
  data,
  evaluation,
  metadata,
}: GenerateReportParams) {

  // ALL SOURCES

  const allSources = [
    ...data.claims,
    ...data.quotes,
    ...data.statistics,
  ];

  // SOURCE BREAKDOWN

  const sourceBreakdown:
    Record<string, number> = {};

  for (const source of allSources) {

    const sourceInfo =
      analyzeSource(
        source.source
      );

    sourceBreakdown[
      sourceInfo.category
    ] =
      (sourceBreakdown[
        sourceInfo.category
      ] || 0) + 1;
  }

  // WEAK SOURCE DETECTION

  const weakSources =
    allSources.filter((item) => {

      const sourceInfo =
        analyzeSource(
          item.source
        );

      return (
        sourceInfo.credibility <
        0.5
      );
    });

  // EXECUTIVE SUMMARY

  const executiveSummary = `
This research analyzed ${
    metadata.sourceCount
  } sources related to "${
    metadata.query
  }".

The system extracted:

- ${data.claims.length} claims
- ${data.quotes.length} quotes
- ${data.statistics.length} statistics

The overall report quality score is ${
    evaluation.overall_score
  } with hallucination risk rated as "${
    evaluation.hallucination_risk
  }".
`;

  return `

# Research Report

---

# Metadata

| Field | Value |
|---|---|
| Query | ${metadata.query} |
| Generated At | ${metadata.generatedAt} |
| Sources Analyzed | ${metadata.sourceCount} |
| Claims Extracted | ${data.claims.length} |
| Quotes Extracted | ${data.quotes.length} |
| Statistics Extracted | ${data.statistics.length} |
| Processing Time | ${metadata.processingTimeMs} ms |
| Estimated Cost | $${metadata.estimatedCost} |
| Total Tokens | ${metadata.totalTokens} |
| Duplicates Removed | ${metadata.duplicatesRemoved} |

---

# Executive Summary

${executiveSummary}

---

# Evaluation Metrics

| Metric | Score |
|---|---|
| Citation Score | ${evaluation.citation_score} |
| Duplicate Score | ${evaluation.duplicate_score} |
| Source Diversity | ${evaluation.source_diversity} |
| Completeness Score | ${evaluation.completeness_score} |
| Grounding Score | ${evaluation.grounding_score} |
| Overall Score | ${evaluation.overall_score} |
| Hallucination Risk | ${evaluation.hallucination_risk} |

---

# Source Breakdown

| Source Category | Count |
|---|---|
${Object.entries(sourceBreakdown)
  .map(
    ([category, count]) =>
      `| ${category} | ${count} |`
  )
  .join("\n")}

---

# Key Claims

${data.claims.map((claim, index) => {

  const sourceInfo =
    analyzeSource(
      claim.source
    );

  return `

## Claim ${index + 1}

### ${claim.title}

${claim.text}

| Field | Value |
|---|---|
| Domain | ${sourceInfo.domain} |
| Category | ${sourceInfo.category} |
| Credibility | ${sourceInfo.credibility} |

Source:
${claim.source}

---
`;
}).join("\n")}

---

# Quotes

${data.quotes.map((quote, index) => {

  const sourceInfo =
    analyzeSource(
      quote.source
    );

  return `

## Quote ${index + 1}

"${quote.text}"

| Field | Value |
|---|---|
| Domain | ${sourceInfo.domain} |
| Category | ${sourceInfo.category} |
| Credibility | ${sourceInfo.credibility} |

Source:
${quote.source}

---
`;
}).join("\n")}

---

# Statistics

${data.statistics.map((stat, index) => {

  const sourceInfo =
    analyzeSource(
      stat.source
    );

  return `

## Statistic ${index + 1}

${stat.text}

| Field | Value |
|---|---|
| Domain | ${sourceInfo.domain} |
| Category | ${sourceInfo.category} |
| Credibility | ${sourceInfo.credibility} |

Source:
${stat.source}

---
`;
}).join("\n")}

---

# Weak Source Warnings

${
  weakSources.length === 0

    ? `
No weak sources detected.
`

    : weakSources.map((item) => {

        const sourceInfo =
          analyzeSource(
            item.source
          );

        return `
- ${sourceInfo.domain}
  (${sourceInfo.credibility})
`;
      }).join("\n")
}

---

# Pipeline Metrics

| Metric | Value |
|---|---|
| Semantic Deduplication Enabled | Yes |
| Citation Verification Enabled | Yes |
| Source Credibility Ranking Enabled | Yes |
| Evaluation Pipeline Enabled | Yes |
| Queue Processing Enabled | Yes |
| Parallel Extraction Enabled | Yes |

---
`;
}