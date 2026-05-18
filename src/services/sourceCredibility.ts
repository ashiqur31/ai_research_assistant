import { credibilityResult, SourceCategory } from "../types/credibility";
import { getErrorDetails } from "../utils/errors";
import { logger } from "../utils/logger";

const DOMAIN_RULES = {
  academic: [
    ".edu",
    "arxiv.org",
    "springer.com",
    "nature.com",
    "sciencedirect.com",
  ],
  government: [".gov", "who.int", "nih.gov", "cdc.gov"],
  news: [
    "reuters.com",
    "bbc.com",
    "nytimes.com",
    "theguardian.com",
    "thehindu.com",
  ],
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

function classifyDomain(domain: string): SourceCategory {
  if (DOMAIN_RULES.academic.some((rule) => domain.includes(rule))) {
    return "academic";
  }

  if (DOMAIN_RULES.government.some((rule) => domain.includes(rule))) {
    return "government";
  }

  if (DOMAIN_RULES.news.some((rule) => domain.includes(rule))) {
    return "news";
  }

  if (domain.includes(".org")) {
    return "organization";
  }

  if (domain.includes("blog")) {
    return "blog";
  }

  return "unknown";
}

function getCredibilityScore(category: SourceCategory): number {
  switch (category) {
    case "academic":
      return 0.95;
    case "government":
      return 0.93;
    case "news":
      return 0.8;
    case "organization":
      return 0.7;
    case "blog":
      return 0.4;
    case "seo":
      return 0.2;
    default:
      return 0.5;
  }
}

export function analyzeSource(url: string): credibilityResult {
  try {
    const domain = extractDomain(url);
    const category = classifyDomain(domain);
    const credibility = getCredibilityScore(category);

    return {
      domain,
      category,
      credibility,
    };
  } catch (error) {
    logger.warn({ error: getErrorDetails(error), url }, "Source analysis failed");
    return {
      domain: "unknown",
      category: "unknown",
      credibility: 0.3,
    };
  }
}
