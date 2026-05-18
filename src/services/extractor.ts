import { openai } from "../services/openai";
import { logger } from "../utils/logger";
import { cleanJsonResponse } from "../utils/jsonCleaner";
import { safeParseResearch } from "../utils/safeParse";
import { metrics } from "../utils/metrics";
import { estimateCost } from "../utils/costTracker";
import { ResearchData } from "../types/research";
import { getErrorMessage } from "../utils/errors";

export async function extractResearchData(
  content: string,
  sourceUrl: string,
  sourceTitle: string,
): Promise<ResearchData> {
  try {
    logger.info({ sourceUrl }, "Starting extraction");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract structured research information.
Return only valid JSON and do not wrap the response in markdown.
Use the exact field names: claims, quotes, statistics.
Use this exact source URL: ${sourceUrl}
Use this exact source title: ${sourceTitle}

Schema:
{
  "claims": [{ "text": string[], "source": string, "title": string }],
  "quotes": [{ "text": string[], "source": string, "title": string }],
  "statistics": [{ "text": string[], "source": string, "title": string }]
}`,
        },
        {
          role: "user",
          content: content.slice(0, 8000),
        },
      ],
      temperature: 0,
    });

    const usage = response.usage;
    const cost = estimateCost(
      "gpt-4o-mini",
      usage?.prompt_tokens || 0,
      usage?.completion_tokens || 0,
    );

    metrics.totalCost += cost;
    metrics.totalTokens += usage?.total_tokens || 0;
    metrics.extractionCalls += 1;

    const raw = response.choices[0].message.content || "{}";
    const cleaned = cleanJsonResponse(raw);

    return safeParseResearch(cleaned);
  } catch (error) {
    logger.error({ error: getErrorMessage(error), sourceUrl }, "Extraction failed");
    return {
      claims: [],
      quotes: [],
      statistics: [],
      duplicatesRemoved: 0,
    };
  }
}
