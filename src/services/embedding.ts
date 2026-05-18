import { estimateCost } from "../utils/costTracker";
import { getErrorDetails } from "../utils/errors";
import { logger } from "../utils/logger";
import { metrics } from "../utils/metrics";
import { openai } from "./openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  const startEmbedding = Date.now();

  try {
    logger.debug({ preview: text.slice(0, 80) }, "Generating embedding");

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const usage = response.usage;
    const cost = estimateCost(
      "text-embedding-3-small",
      usage?.prompt_tokens,
      0,
    );

    metrics.totalCost += cost;
    metrics.totalTokens += usage?.total_tokens || 0;
    metrics.embeddingCalls += 1;

    logger.debug(
      { duration_ms: Date.now() - startEmbedding },
      "Embedding generated",
    );

    return response.data[0].embedding;
  } catch (error) {
    logger.error({ error: getErrorDetails(error) }, "Embedding failed");
    throw error;
  }
}
