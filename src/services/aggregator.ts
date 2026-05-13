import { ResearchData } from "../types/research";
import { deDuplicateEvidience } from "../utils/deDuplicate";

export function aggregateResearch(data: ResearchData[]): ResearchData {
  return {
    claims: deDuplicateEvidience(data.flatMap((d) => d.claims)),
    quotes: deDuplicateEvidience(data.flatMap(d => d.quotes)),
    statistics: deDuplicateEvidience(data.flatMap(d => d.statistics)),
  }
}