import { QueueEvents } from "bullmq";
import { createRedisConnection } from "./config/redis";
import { researchQueue } from "./queues/researchQueue";
import { subscribeToProgress } from "./services/progressSubscriber";
import { getErrorDetails } from "./utils/errors";
import { logger } from "./utils/logger";

const queueEvents = new QueueEvents("research-queue", {
  connection: createRedisConnection(),
});

async function main() {
  const job = await researchQueue.add("research-job", {
    query: "Best Scholarship Programs",
  });

  if (!job.id) {
    throw new Error("Research job was created without an id.");
  }

  logger.info({ jobId: job.id }, "Research job added");
  await subscribeToProgress(job.id);
  logger.info("Listening for progress updates");

  const result = await job.waitUntilFinished(queueEvents);
  logger.info({ result }, "Final report received");
  await queueEvents.close();
}

main().catch((error) => {
  logger.error({ error: getErrorDetails(error) }, "App failed");
  void queueEvents.close();
});
