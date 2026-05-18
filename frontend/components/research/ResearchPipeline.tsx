"use client";

import type { ProgressStage } from "@/types/research";

type Props = {
  stages: ProgressStage[];
  error?: string | null;
};

function statusClass(stage: string) {
  const normalized = stage.toLowerCase();

  if (normalized.includes("complete")) {
    return "bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.55)]";
  }

  if (normalized.includes("fail") || normalized.includes("error")) {
    return "bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.45)]";
  }

  if (normalized.includes("queue") || normalized.includes("submit")) {
    return "bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.45)]";
  }

  return "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.35)]";
}

export function ResearchPipeline({ stages, error }: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#13171c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
          Live Pipeline
        </p>
        <h3 className="font-heading text-2xl text-white">Execution timeline</h3>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Streaming when available, with client-side fallbacks for backend quirks.
        </p>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-5 py-6 text-sm text-rose-100">
          {error}
        </div>
      ) : stages.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-center text-sm text-[#94a3b8]">
          Start a run to see progress updates here.
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((item, index) => (
            <div
              key={`${item.stage}-${item.message}-${index}`}
              className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-[#0d1117] px-4 py-4"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${statusClass(item.stage)}`}
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{item.message}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7f8ea3]">
                    {item.stage} · {item.source}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs text-[#7f8ea3]">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
