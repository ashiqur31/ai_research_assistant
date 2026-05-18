import axios from "axios";
import { logger } from "../utils/logger";
import { TavilySearchResult } from "../types/search";
import { retry } from "../utils/retry";
import { env } from "../config/env";
import { getErrorMessage } from "../utils/errors";

export async function searchWeb(query: string): Promise<TavilySearchResult[]> {
  const start = Date.now();

  if (!env.tavilyApiKey) {
    logger.warn({ tool: "tavily_search" }, "Missing Tavily API key.");
    return [];
  }

  try {
    logger.info({ tool: "tavily_search", query }, "Starting Tavily search");

    const response = await retry(() =>
      axios.post(
        "https://api.tavily.com/search",
        {
          api_key: env.tavilyApiKey,
          query,
          search_depth: "advanced",
          include_answer: false,
          include_raw_content: false,
          max_results: 5,
        },
        { timeout: 15000 },
      ),
    );

    const results: TavilySearchResult[] = response.data.results.map(
      (item: Record<string, unknown>) => ({
        title: String(item.title ?? ""),
        url: String(item.url ?? ""),
        content: String(item.content ?? ""),
        score: Number(item.score ?? 0),
      }),
    );

    logger.info(
      {
        tool: "tavily_search",
        query,
        results: results.length,
        duration_ms: Date.now() - start,
      },
      "Tavily search completed",
    );

    return results;
  } catch (error) {
    logger.error(
      {
        tool: "tavily_search",
        query,
        error: getErrorMessage(error),
      },
      "Tavily search failed",
    );
    return [];
  }
}
