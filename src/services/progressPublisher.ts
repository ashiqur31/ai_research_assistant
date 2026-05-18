import { createRedisConnection } from "../config/redis";
import { getErrorDetails } from "../utils/errors";
import { logger } from "../utils/logger";

const redis = createRedisConnection();

export async function publishProgress(
  jobId: string,
  stage: string,
  message: string,
) {
  try {
    await redis.publish(
      `research-progress:${jobId}`,
      JSON.stringify({
        stage,
        message,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    logger.warn({ error: getErrorDetails(error), jobId }, "Progress publish failed");
  }
}
