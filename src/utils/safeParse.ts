import { ResearchSchema } from "../types/research";
import { normalizeResearchData } from "./normalizeResearch";

export function safeParseResearch(text:string) {
  try {
    const parsed = JSON.parse(text)
    const normalize = normalizeResearchData(parsed)
    return ResearchSchema.parse(normalize)
  } catch (error) {
    console.error("Parse failed: ", error)
    return {
      claims: [],
      quotes: [],
      statistics: []
    }
  }
}