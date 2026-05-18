"use client";

import { type FormEvent, useState } from "react";

type Props = {
  loading: boolean;
  onSubmit: (query: string) => Promise<void>;
};

const examplePrompts = [
  "Compare the latest retrieval-augmented generation evaluation methods.",
  "Summarize policy risks of frontier AI model deployment in healthcare.",
  "Map the semiconductor supply chain exposure for India and the US.",
];

export function ResearchInput({ loading, onSubmit }: Props) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedQuery || loading) {
      return;
    }

    await onSubmit(trimmedQuery);
  }

  return (
    <form
      id="workspace"
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/10 bg-[#13171c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur"
    >
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
            Research Brief
          </p>
          <h3 className="font-heading text-3xl text-white">Launch a new run</h3>
          <p className="mt-1 max-w-2xl text-sm text-[#94a3b8]">
            Send a question to the backend pipeline and monitor its status from a
            single workspace.
          </p>
        </div>

        <div className="rounded-full border border-[#f3b95f]/20 bg-[#f3b95f]/10 px-3 py-1 text-xs text-[#ffd696]">
          Backend-backed UI only
        </div>
      </div>

      <textarea
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="What would you like to research?"
        className="h-44 w-full resize-none rounded-[1.75rem] border border-white/10 bg-[#0b0e13] p-5 text-base text-white outline-none transition placeholder:text-[#607086] focus:border-[#f3b95f]/50 focus:ring-2 focus:ring-[#f3b95f]/15"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={loading}
            onClick={() => setQuery(prompt)}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-[#b7c3d4] transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-[#7f8ea3]">
          The frontend sends the raw research string expected by the current API.
        </p>

        <button
          type="submit"
          disabled={loading || !trimmedQuery}
          className="rounded-full bg-[linear-gradient(135deg,#f4c56a_0%,#ef7d3a_100%)] px-5 py-3 text-sm font-semibold text-[#16120c] transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Researching..." : "Start Research"}
        </button>
      </div>
    </form>
  );
}
