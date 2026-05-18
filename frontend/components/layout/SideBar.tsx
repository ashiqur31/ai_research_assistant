"use client";

const navItems = [
  {
    label: "Workspace",
    href: "#workspace",
  },
  {
    label: "History",
    href: "#history",
  },
  {
    label: "Metrics",
    href: "#metrics",
  },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#090c11] px-6 py-8 xl:flex xl:flex-col">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-[#8ca0b3]">
          ResearchOS
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-none text-white">
          Command center
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#94a3b8]">
          A focused surface for job submission, pipeline visibility, cached
          reports, and backend metrics.
        </p>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#dbe4ee] transition hover:border-white/20 hover:bg-white/10"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.75rem] border border-[#f3b95f]/20 bg-[linear-gradient(180deg,rgba(243,185,95,0.14)_0%,rgba(243,185,95,0.04)_100%)] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-[#ffd696]">
          Constraint
        </p>
        <p className="mt-3 text-sm leading-6 text-[#fbe4bb]">
          This pass keeps the backend untouched and absorbs API inconsistencies
          in the frontend.
        </p>
      </div>
    </aside>
  );
}
