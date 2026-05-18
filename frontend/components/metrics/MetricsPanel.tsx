"use client";

import type { Metrics } from "@/types/research";

type Props = {
  metrics: Metrics | null;
  loading: boolean;
  error: string | null;
};

export function MetricsPanel({ metrics, loading, error }: Props) {
  return (
    <section
      id="metrics"
      className="rounded-[2rem] border border-white/10 bg-[#13171c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur"
    >
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
          Operations
        </p>
        <h3 className="font-heading text-2xl text-white">System metrics</h3>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Live visibility into token usage and backend workload.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-sm text-[#94a3b8]">
          Loading metrics...
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-sm text-rose-100">
          {error}
        </div>
      ) : !metrics ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-sm text-[#94a3b8]">
          No metrics available yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Tokens"
            value={metrics.totalTokens.toLocaleString()}
          />
          <MetricCard
            label="Estimated Cost"
            value={`$${metrics.totalCost.toFixed(4)}`}
          />
          <MetricCard
            label="Extraction Calls"
            value={String(metrics.extractionCalls)}
          />
          <MetricCard
            label="Embedding Calls"
            value={String(metrics.embeddingCalls)}
          />
        </div>
      )}
    </section>
  );
}

type CardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: CardProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0d1117] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#7f8ea3]">
        {label}
      </p>
      <h4 className="mt-3 text-2xl font-semibold text-white">{value}</h4>
    </div>
  );
}
