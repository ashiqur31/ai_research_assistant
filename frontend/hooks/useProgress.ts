"use client";

import { useEffect, useMemo, useState } from "react";
import { getResearchStreamUrl } from "@/services/api";
import type { ProgressStage, ResearchJobState } from "@/types/research";

type StreamState = {
  jobId: string | null;
  stages: ProgressStage[];
};

function clientStage(stage: string, message: string): ProgressStage {
  return {
    stage,
    message,
    timestamp: new Date().toISOString(),
    source: "client",
  };
}

export function useProgress(jobId: string | null, jobState: ResearchJobState) {
  const [streamState, setStreamState] = useState<StreamState>({
    jobId: null,
    stages: [],
  });

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const source = new EventSource(getResearchStreamUrl(jobId));

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          stage?: string;
          message?: string;
          timestamp?: string;
        };

        if (!parsed.stage || !parsed.message) {
          return;
        }

        const stage = parsed.stage;
        const message = parsed.message;

        setStreamState((previous) => ({
          jobId,
          stages:
            previous.jobId === jobId
              ? [
                  ...previous.stages,
                  {
                    stage,
                    message,
                    timestamp: parsed.timestamp ?? new Date().toISOString(),
                    source: "stream",
                  },
                ]
              : [
                  {
                    stage,
                    message,
                    timestamp: parsed.timestamp ?? new Date().toISOString(),
                    source: "stream",
                  },
                ],
        }));
      } catch (error) {
        console.error("Failed to parse progress update:", error);
      }
    };

    source.onerror = (error) => {
      console.error("SSE error:", error);
      source.close();
    };

    return () => {
      source.close();
    };
  }, [jobId]);

  const stages = useMemo(() => {
    if (!jobId) {
      return [];
    }

    const baseStages: ProgressStage[] = [
      clientStage("submitted", `Job ${jobId} has been created.`),
    ];

    if (jobState === "queued") {
      baseStages.push(clientStage("queued", "Research job has entered the queue."));
    }

    if (jobState === "processing") {
      baseStages.push(
        clientStage("processing", "Backend is processing the research request."),
      );
    }

    if (jobState === "completed") {
      baseStages.push(
        clientStage("completed", "Research result is available in the workspace."),
      );
    }

    if (jobState === "failed") {
      baseStages.push(clientStage("failed", "Research could not be completed."));
    }

    const merged = [
      ...baseStages,
      ...(streamState.jobId === jobId ? streamState.stages : []),
    ];

    return merged.filter((stage, index) => {
      return (
        merged.findIndex(
          (candidate) =>
            candidate.stage === stage.stage && candidate.message === stage.message,
        ) === index
      );
    });
  }, [jobId, jobState, streamState]);

  return {
    stages,
  };
}
