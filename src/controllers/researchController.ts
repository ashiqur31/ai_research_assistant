import { Request, Response } from "express";
import { createRedisConnection } from "../config/redis";
import { researchQueue } from "../queues/researchQueue";
import { prisma } from "../lib/prisma";
import { metrics } from "../utils/metrics";
import { logger } from "../utils/logger";
import { getErrorDetails } from "../utils/errors";
import { normalizeQuery } from "../utils/normalizeQuery";

export async function createResearch(req: Request, res: Response) {
  try {
    const { query } = req.body;

    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "A non-empty query string is required." });
    }

    const normalizedQuery = normalizeQuery(query);
    const cached = await prisma.researchCache.findUnique({
      where: { query: normalizedQuery },
    });

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        jobId: null,
        result: {
          report: cached.report,
          evaluation: null,
        },
      });
    }

    const job = await researchQueue.add("research-job", { query });

    return res.status(202).json({
      success: true,
      cached: false,
      jobId: job.id,
    });
  } catch (error) {
    logger.error({ error: getErrorDetails(error) }, "Failed to create research job");
    return res.status(500).json({ error: "Failed to create research job." });
  }
}

export async function getResearch(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const job = await researchQueue.getJob(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    const state = await job.getState();
    const result = job.returnvalue ?? null;
    const failedReason =
      typeof job.failedReason === "string" && job.failedReason.trim()
        ? job.failedReason
        : null;

    return res.json({ id, state, result, failedReason });
  } catch (error) {
    logger.error({ error: getErrorDetails(error) }, "Failed to fetch research job");
    return res.status(500).json({
      error: "Failed to fetch research job.",
    });
  }
}

export async function streamResearchProgress(req: Request, res: Response) {
  const id = String(req.params.id);
  const channel = `research-progress:${id}`;
  const subscriber = createRedisConnection();
  let isClosed = false;
  let heartbeat: NodeJS.Timeout | null = null;

  const cleanup = async () => {
    if (isClosed) {
      return;
    }

    isClosed = true;

    if (heartbeat) {
      clearInterval(heartbeat);
    }

    subscriber.off("message", onMessage);
    subscriber.off("error", onRedisError);

    try {
      await subscriber.unsubscribe(channel);
    } catch (error) {
      logger.debug(
        { error: getErrorDetails(error), channel },
        "Progress unsubscribe skipped",
      );
    }

    await subscriber.quit();
  };

  const onMessage = (incomingChannel: string, message: string) => {
    if (incomingChannel !== channel || isClosed) {
      return;
    }

    res.write(`data: ${message}\n\n`);
  };

  const onRedisError = (error: Error) => {
    logger.warn({ error: getErrorDetails(error), channel }, "Progress stream Redis error");
  };

  try {
    const job = await researchQueue.getJob(id);

    if (!job) {
      await cleanup();
      return res.status(404).json({ error: "Job not found." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    await subscriber.subscribe(channel);
    subscriber.on("message", onMessage);
    subscriber.on("error", onRedisError);

    res.write(
      `data: ${JSON.stringify({
        stage: "connected",
        message: "Progress stream connected.",
        timestamp: new Date().toISOString(),
      })}\n\n`,
    );

    heartbeat = setInterval(() => {
      if (!isClosed) {
        res.write(": keep-alive\n\n");
      }
    }, 15000);

    req.on("close", () => {
      void cleanup().finally(() => {
        res.end();
      });
    });
  } catch (error) {
    logger.error({ error: getErrorDetails(error), channel }, "Streaming failed");
    await cleanup();

    if (res.headersSent) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          error: "Streaming failed.",
        })}\n\n`,
      );
      res.end();
      return;
    }

    return res.status(500).json({ error: "Streaming failed." });
  }
}

export async function getResearchHistory(_: Request, res: Response) {
  try {
    const history = await prisma.researchCache.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return res.json(history);
  } catch (error) {
    logger.error({ error: getErrorDetails(error) }, "Failed to fetch history");
    return res.status(500).json({ error: "Failed to fetch history." });
  }
}

export async function getMetrics(_: Request, res: Response) {
  try {
    return res.json({
      totalCost: metrics.totalCost,
      totalTokens: metrics.totalTokens,
      extractionCalls: metrics.extractionCalls,
      embeddingCalls: metrics.embeddingCalls,
    });
  } catch (error) {
    logger.error({ error: getErrorDetails(error) }, "Failed to fetch metrics");
    return res.status(500).json({ error: "Failed to fetch metrics." });
  }
}
