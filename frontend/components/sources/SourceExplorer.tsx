"use client";

type Source = {
  title: string;
  source: string;
  credibility: number;
  category: string;
};

type Props = {
  sources: Source[];
};

export function SourceExplorer({ sources }: Props) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">Source Explorer</h3>

        <p className="text-sm text-zinc-400 mt-1">
          Credibility-ranked evidence
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-2xl p-6 text-center">
          No sources available
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div
              key={index}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-sm leading-relaxed">
                    {source.title}
                  </h4>

                  <a
                    href={source.source}
                    target="_blank"
                    className="text-xs text-zinc-500 mt-2 block hover:text-zinc-300"
                  >
                    {source.source}
                  </a>
                </div>

                <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full whitespace-nowrap">
                  {source.category}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-400">Credibility</span>

                  <span>{(source.credibility * 100).toFixed(0)}%</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{
                      width: `${source.credibility * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
