import { Worker } from "bullmq";
import { connection } from "../config/redis";
import { searchWeb } from "../tools/tavily";
import { extractResearchData } from "../services/extractor";
import { aggregateResearch } from "../services/aggregator";
import { generateMarkdownReport } from "../services/reportGenerator";
import { evaluateResearch } from "../services/evaluator";
import { metrics } from "../utils/metrics";
import { getCachedResearch, setCachedResearch } from "../services/cache";
import { prisma } from "../lib/prisma";
import { publishProgress } from "../services/progressPublisher";
import { EvaluationResult } from "../types/evaluation";
import { getErrorDetails } from "../utils/errors";
import { logger } from "../utils/logger";
import { normalizeQuery } from "../utils/normalizeQuery";

type CachedResearchResult = {
  report: string;
  evaluation: EvaluationResult | null;
};

function resetMetrics() {
  metrics.totalCost = 0;
  metrics.totalTokens = 0;
  metrics.embeddingCalls = 0;
  metrics.extractionCalls = 0;
}

const worker = new Worker(
  "research-queue",
  async (job) => {
    const startTime = Date.now();
    const jobId = job.id;
    resetMetrics();

    try {
      if (!jobId) {
        throw new Error("Worker received a job without an id.");
      }

      const rawQuery = job.data?.query;

      if (typeof rawQuery !== "string" || !rawQuery.trim()) {
        throw new Error("Invalid query provided to worker.");
      }

      const normalizedQuery = normalizeQuery(rawQuery);

      logger.info({ jobId, query: rawQuery }, "Worker started");

      const cached = await getCachedResearch<CachedResearchResult>(normalizedQuery);

      if (cached) {
        await publishProgress(jobId, "completed", "Loaded report from Redis cache.");
        return cached;
      }

      const persisted = await prisma.researchCache.findUnique({
        where: {
          query: normalizedQuery,
        },
      });

      if (persisted) {
        const persistedResult: CachedResearchResult = {
          report: persisted.report,
          evaluation: null,
        };

        await setCachedResearch(normalizedQuery, persistedResult);
        await publishProgress(
          jobId,
          "completed",
          "Loaded report from PostgreSQL cache.",
        );

        return persistedResult;
      }

      await publishProgress(jobId, "search", "Searching the web for sources.");
      const results = await searchWeb(rawQuery);

      await publishProgress(
        jobId,
        "search_completed",
        `Found ${results.length} sources.`,
      );

      await publishProgress(jobId, "extraction", "Extracting structured evidence.");
      const extractedResults = await Promise.all(
        results.map((result) =>
          extractResearchData(result.content, result.url, result.title),
        ),
      );

      await publishProgress(
        jobId,
        "deduplication",
        "Removing semantically duplicate findings.",
      );
      const aggregated = await aggregateResearch(extractedResults);

      await publishProgress(jobId, "evaluation", "Evaluating research quality.");
      const evaluation = evaluateResearch(aggregated);

      await publishProgress(jobId, "report", "Generating final report.");
      const report = generateMarkdownReport({
        data: aggregated,
        evaluation,
        metadata: {
          query: rawQuery,
          generatedAt: new Date().toISOString(),
          sourceCount: results.length,
          processingTimeMs: Date.now() - startTime,
          estimatedCost: metrics.totalCost,
          duplicatesRemoved: aggregated.duplicatesRemoved ?? 0,
          totalTokens: metrics.totalTokens,
        },
      });

      const result: CachedResearchResult = { report, evaluation };

      await prisma.researchCache.upsert({
        where: { query: normalizedQuery },
        update: { report },
        create: {
          query: normalizedQuery,
          report,
        },
      });

      await setCachedResearch(normalizedQuery, result);
      await publishProgress(jobId, "completed", "Research completed.");

      return result;
    } catch (error) {
      logger.error({ error: getErrorDetails(error), jobId }, "Worker failed");

      if (jobId) {
        await publishProgress(jobId, "error", "Research failed.");
      }

      throw error;
    }
  },
  {
    connection,
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600,
    },
    concurrency: 1,
  },
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job completed");
});

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, error: getErrorDetails(err) }, "Job failed");
});

worker.on("error", (err) => {
  logger.error({ error: getErrorDetails(err) }, "Worker error");
});
