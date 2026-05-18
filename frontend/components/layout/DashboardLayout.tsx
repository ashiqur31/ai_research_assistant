"use client";

import { useEffect } from "react";
import { Sidebar } from "./SideBar";
import { Topbar } from "./TopBar";
import { ResearchInput } from "../research/ResearchInput";
import { ResearchPipeline } from "../research/ResearchPipeline";
import { ReportViewer } from "../research/ReportViewer";
import { ResearchHistory } from "../research/ResearchHistory";
import { MetricsPanel } from "../metrics/MetricsPanel";
import { EvaluationPanel } from "../metrics/EvaluationPanel";
import { useResearch } from "@/hooks/useResearch";
import { useProgress } from "@/hooks/useProgress";
import { useHistory } from "@/hooks/useHistory";
import { useMetrics } from "@/hooks/useMetrics";

export default function DashboardLayout() {
  const {
    loading,
    jobId,
    jobState,
    currentQuery,
    report,
    evaluation,
    selectedHistoryItem,
    error,
    startResearch,
    openHistoryItem,
  } = useResearch();
  const { stages } = useProgress(jobId, jobState);
  const {
    history,
    loading: historyLoading,
    error: historyError,
    refreshHistory,
  } = useHistory();
  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
    refreshMetrics,
  } = useMetrics();

  const completedRuns = history.length;

  useEffect(() => {
    if (jobState !== "completed") {
      return;
    }

    refreshHistory();
    refreshMetrics();
  }, [jobState, refreshHistory, refreshMetrics]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,197,106,0.18),transparent_28%),linear-gradient(180deg,#0b0e13_0%,#0f141a_45%,#0a0d12_100%)] text-white">
      <div className="mx-auto flex max-w-[1680px]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Topbar jobState={jobState} currentQuery={currentQuery} />

          <div className="space-y-6 px-4 py-6 md:px-6 xl:px-8">
            <section className="grid gap-4 lg:grid-cols-3">
              <SummaryCard
                eyebrow="Active State"
                value={jobState}
                detail="Tracks the current job lifecycle from submission through completion."
              />
              <SummaryCard
                eyebrow="Cached Reports"
                value={String(completedRuns)}
                detail="Backed by the research history API and available for instant reopening."
              />
              <SummaryCard
                eyebrow="Token Footprint"
                value={
                  metrics ? metrics.totalTokens.toLocaleString() : metricsLoading ? "..." : "0"
                }
                detail="Pulled from backend metrics with automatic refresh every 15 seconds."
              />
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <ResearchInput loading={loading} onSubmit={startResearch} />
                <ResearchPipeline stages={stages} error={error} />
                <ResearchHistory
                  history={history}
                  loading={historyLoading}
                  error={historyError}
                  selectedId={selectedHistoryItem?.id}
                  onSelect={openHistoryItem}
                />
              </div>

              <div className="space-y-6">
                <ReportViewer report={report} query={currentQuery} />
                <EvaluationPanel evaluation={evaluation} />
                <MetricsPanel
                  metrics={metrics}
                  loading={metricsLoading}
                  error={metricsError}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

type SummaryCardProps = {
  eyebrow: string;
  value: string;
  detail: string;
};

function SummaryCard({ eyebrow, value, detail }: SummaryCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-heading text-3xl capitalize text-white">{value}</h3>
      <p className="mt-3 text-sm leading-6 text-[#94a3b8]">{detail}</p>
    </div>
  );
}
