import { ResearchData, ResearchSchema } from "../types/research";
import { getErrorDetails } from "./errors";
import { logger } from "./logger";
import { normalizeResearchData } from "./normalizeResearch";

export function safeParseResearch(text: string): ResearchData {
  try {
    const parsed = JSON.parse(text);
    const normalized = normalizeResearchData(parsed);
    return ResearchSchema.parse(normalized);
  } catch (error) {
    logger.warn({ error: getErrorDetails(error) }, "Research JSON parse failed");
    return {
      claims: [],
      quotes: [],
      statistics: [],
      duplicatesRemoved: 0,
    };
  }
}
