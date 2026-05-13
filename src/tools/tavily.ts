import axios from "axios";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import { TavilySearchResult } from "../types/search";
import { retry } from "../utils/retry";

dotenv.config();

const API_KEY = process.env.TAVILY_API_KEY;

export async function searchWeb(query: string): Promise<TavilySearchResult[]> {
  const start = Date.now();
  try {
    logger.info({ tool: "tavily_search", query }, "Starting Travily Search");
    const response: any = await retry(() => axios.post(
      "https://api.tavily.com/search",
      {
        api_key: API_KEY,
        query,
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: false,
        max_result: 5,
      },
      { timeout: 15000 },
    ));
    const results: TavilySearchResult[] = 
      response.data.results.map((item: any) => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score
      }))

    logger.info(
      {
        tool: "tavily_search",
        query,
        results: results.length,
        duration_ms: Date.now() - start
      },
      "Tavily search completed"
    )
    return results;
  } catch (error: any) {
    logger.error(
      {
        tool: "tavily_search",
        query,
        error: error.message,
      },
      "Travily search failed",
    );
    return [];
  }
}
