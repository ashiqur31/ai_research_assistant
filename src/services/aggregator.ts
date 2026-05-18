import { ResearchData } from "../types/research";

import { semanticDuplicate } from "../utils/semanticDuplicator";

export async function aggregateResearch(
  data: ResearchData[],
): Promise<ResearchData> {
  const claimsResult = await semanticDuplicate(data.flatMap((d) => d.claims));

  const quotesResult = await semanticDuplicate(data.flatMap((d) => d.quotes));

  const statisticsResult = await semanticDuplicate(
    data.flatMap((d) => d.statistics),
  );

  return {
    claims: claimsResult.deDuplicated,

    quotes: quotesResult.deDuplicated,

    statistics: statisticsResult.deDuplicated,

    duplicatesRemoved:
      claimsResult.duplicatesRemoved +
      quotesResult.duplicatesRemoved +
      statisticsResult.duplicatesRemoved,
  };
}
