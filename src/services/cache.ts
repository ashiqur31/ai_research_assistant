import { createRedisConnection } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { normalizeQuery } from "../utils/normalizeQuery";
import { getErrorDetails } from "../utils/errors";

const CACHE_PREFIX = "research:";
const redis = createRedisConnection();

function getCacheKey(query: string) {
  return CACHE_PREFIX + normalizeQuery(query);
}

export async function getCachedResearch<T>(query: string): Promise<T | null> {
  try {
    const cached = await redis.get(getCacheKey(query));

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as T;
  } catch (error) {
    logger.warn({ error: getErrorDetails(error) }, "Redis cache read failed");
    return null;
  }
}

export async function setCachedResearch(query: string, data: unknown) {
  try {
    await redis.set(
      getCacheKey(query),
      JSON.stringify(data),
      "EX",
      env.cacheTtlSeconds,
    );
  } catch (error) {
    logger.warn({ error: getErrorDetails(error) }, "Redis cache write failed");
  }
}
