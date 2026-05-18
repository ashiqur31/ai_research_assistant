"use client";

import type { Evaluation } from "@/types/research";

type Props = {
  evaluation: Evaluation | null;
};

export function EvaluationPanel({ evaluation }: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#13171c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
          Quality
        </p>
        <h3 className="font-heading text-2xl text-white">Report evaluation</h3>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Scores computed by the backend evaluation pipeline.
        </p>
      </div>

      {!evaluation ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-center text-sm text-[#94a3b8]">
          Evaluation appears after a fresh run returns structured results.
        </div>
      ) : (
        <div className="space-y-5">
          <MetricBar label="Citation Score" value={evaluation.citation_score} />
          <MetricBar
            label="Source Diversity"
            value={evaluation.source_diversity}
          />
          <MetricBar
            label="Completeness Score"
            value={evaluation.completeness_score}
          />
          <MetricBar
            label="Grounding Score"
            value={evaluation.grounding_score}
          />
          <MetricBar
            label="Overall Score"
            value={evaluation.overall_score}
          />

          <div className="rounded-[1.5rem] border border-white/10 bg-[#0d1117] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94a3b8]">Hallucination Risk</span>
              <span
                className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                  evaluation.hallucination_risk === "low"
                    ? "bg-emerald-400/12 text-emerald-200"
                    : evaluation.hallucination_risk === "medium"
                      ? "bg-amber-400/12 text-amber-200"
                      : "bg-rose-400/12 text-rose-200"
                }`}
              >
                {evaluation.hallucination_risk}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type MetricBarProps = {
  label: string;
  value: number;
};

function MetricBar({ label, value }: MetricBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(value * 100)));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-white">{label}</span>
        <span className="text-[#94a3b8]">{percentage}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#f4b861_0%,#f97316_100%)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
