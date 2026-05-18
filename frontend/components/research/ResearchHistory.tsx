"use client";

import type { HistoryItem } from "@/types/research";

type Props = {
  history: HistoryItem[];
  loading: boolean;
  error: string | null;
  selectedId?: string;
  onSelect: (item: HistoryItem) => void;
};

export function ResearchHistory({
  history,
  loading,
  error,
  selectedId,
  onSelect,
}: Props) {
  return (
    <section
      id="history"
      className="rounded-[2rem] border border-white/10 bg-[#13171c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
            Archive
          </p>
          <h3 className="font-heading text-2xl text-white">Research history</h3>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Re-open a cached report without rerunning the pipeline.
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
          {history.length} stored runs
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-sm text-[#94a3b8]">
          Loading history...
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-5 py-8 text-sm text-rose-100">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-5 py-8 text-center text-sm text-[#94a3b8]">
          No research history yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const active = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                  active
                    ? "border-[#f3b95f] bg-[#201a11]"
                    : "border-white/10 bg-[#0d1117] hover:border-white/20 hover:bg-[#11161c]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="line-clamp-2 text-sm font-medium text-white">
                      {item.query}
                    </h4>
                    <p className="mt-2 text-xs text-[#7f8ea3]">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#94a3b8]">
                    Cached
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
