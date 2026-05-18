"use client";

import { API_BASE_URL } from "@/constants/constants";
import type { ResearchJobState } from "@/types/research";

type Props = {
  jobState: ResearchJobState;
  currentQuery: string;
};

function formatJobState(jobState: ResearchJobState) {
  switch (jobState) {
    case "submitting":
      return "Submitting";
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Idle";
  }
}

export function Topbar({ jobState, currentQuery }: Props) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0d12]/85 px-6 py-5 backdrop-blur xl:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#8ca0b3]">
            Research Assistant
          </p>
          <h2 className="font-heading text-3xl text-white">
            AI research workspace
          </h2>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Frontend-only integration of the existing research APIs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <StatusPill label="API" value={API_BASE_URL.replace(/^https?:\/\//, "")} />
          <StatusPill label="Job" value={formatJobState(jobState)} />
          <StatusPill
            label="Focus"
            value={currentQuery || "Waiting for a new brief"}
            long
          />
        </div>
      </div>
    </div>
  );
}

type StatusPillProps = {
  label: string;
  value: string;
  long?: boolean;
};

function StatusPill({ label, value, long }: StatusPillProps) {
  return (
    <div
      className={`rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#dbe4ee] ${
        long ? "max-w-sm truncate" : ""
      }`}
      title={value}
    >
      <span className="mr-2 text-xs uppercase tracking-[0.18em] text-[#7f8ea3]">
        {label}
      </span>
      {value}
    </div>
  );
}
