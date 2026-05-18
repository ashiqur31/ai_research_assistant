import { createRedisConnection } from "../config/redis";
import { logger } from "../utils/logger";
import { getErrorDetails } from "../utils/errors";

const redis = createRedisConnection();

export async function subscribeToProgress(jobId: string) {
  const channel = `research-progress:${jobId}`;
  await redis.subscribe(channel);
  logger.info({ channel }, "Subscribed to research progress");

  redis.on("message", (_, message) => {
    try {
      const parsed = JSON.parse(message);
      logger.info({ progress: parsed }, "Progress update");
    } catch (error) {
      logger.warn(
        { error: getErrorDetails(error), message },
        "Failed to parse progress update",
      );
    }
  });
}
