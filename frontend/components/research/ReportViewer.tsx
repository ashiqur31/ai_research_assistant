"use client";

import { useMemo, type ReactNode } from "react";

type Props = {
  report: string;
  query?: string;
};

type ReportBlock =
  | {
      type: "heading";
      level: number;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "table";
      header: string[];
      rows: string[][];
    }
  | {
      type: "rule";
    };

const headingPattern = /^(#{1,6})\s+(.+)$/;
const rulePattern = /^-{3,}$/;
const listPattern = /^\s*[-*]\s+(.+)$/;
const tableSeparatorPattern = /^:?-{3,}:?$/;
const urlPattern = /(https?:\/\/[^\s<>"']+)/g;

function isHeading(line: string) {
  return headingPattern.test(line.trim());
}

function isRule(line: string) {
  return rulePattern.test(line.trim());
}

function isListItem(line: string) {
  return listPattern.test(line);
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparatorRow(cells: string[]) {
  return cells.every((cell) => tableSeparatorPattern.test(cell));
}

function isTableStart(lines: string[], index: number) {
  const current = lines[index]?.trim();
  const next = lines[index + 1]?.trim();

  if (!current?.startsWith("|") || !next?.startsWith("|")) {
    return false;
  }

  return isTableSeparatorRow(parseTableRow(next));
}

function parseReport(report: string): ReportBlock[] {
  const lines = report.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: ReportBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index] ?? "";
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = headingPattern.exec(line);

    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    if (isRule(line)) {
      if (blocks.at(-1)?.type !== "rule") {
        blocks.push({ type: "rule" });
      }

      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableLines: string[] = [];

      while (lines[index]?.trim().startsWith("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      const rows = tableLines.map(parseTableRow);
      const header = rows[0] ?? [];
      const body = rows.slice(1).filter((row) => !isTableSeparatorRow(row));

      blocks.push({
        type: "table",
        header,
        rows: body,
      });
      continue;
    }

    if (isListItem(rawLine)) {
      const items: string[] = [];

      while (index < lines.length && isListItem(lines[index] ?? "")) {
        const itemMatch = listPattern.exec(lines[index] ?? "");

        if (itemMatch) {
          items.push(itemMatch[1].trim());
        }

        index += 1;

        while (
          index < lines.length &&
          /^\s{2,}\S/.test(lines[index] ?? "") &&
          !isListItem(lines[index] ?? "")
        ) {
          items[items.length - 1] = `${items[items.length - 1]} ${lines[
            index
          ].trim()}`;
          index += 1;
        }
      }

      blocks.push({
        type: "list",
        items,
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const nextRawLine = lines[index] ?? "";
      const nextLine = nextRawLine.trim();

      if (
        !nextLine ||
        isHeading(nextLine) ||
        isRule(nextLine) ||
        isTableStart(lines, index) ||
        isListItem(nextRawLine)
      ) {
        break;
      }

      paragraphLines.push(nextLine);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
  }

  return blocks.filter((block, blockIndex) => {
    if (block.type !== "rule") {
      return true;
    }

    const previous = blocks[blockIndex - 1];
    const next = blocks[blockIndex + 1];

    return previous?.type !== "heading" && next?.type !== "heading";
  });
}

function readableLabel(value: string) {
  return value.replace(/_/g, " ");
}

function scoreColor(value: string) {
  const score = Number(value);

  if (Number.isNaN(score)) {
    return "text-[#d8e0ea]";
  }

  if (score >= 0.75) {
    return "text-emerald-200";
  }

  if (score >= 0.45) {
    return "text-amber-200";
  }

  return "text-rose-200";
}

function renderInline(text: string): ReactNode[] {
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const url = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      content.push(text.slice(lastIndex, start));
    }

    const cleanUrl = url.replace(/[),.;]+$/, "");
    const trailing = url.slice(cleanUrl.length);

    content.push(
      <a
        key={`${cleanUrl}-${start}`}
        href={cleanUrl}
        target="_blank"
        rel="noreferrer"
        className="break-all rounded-md border border-[#f4c56a]/20 bg-[#f4c56a]/10 px-1.5 py-0.5 text-[#ffd696] underline decoration-[#f4c56a]/40 underline-offset-4 transition hover:border-[#f4c56a]/40 hover:text-white"
      >
        {cleanUrl}
      </a>,
    );

    if (trailing) {
      content.push(trailing);
    }

    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) {
    content.push(text.slice(lastIndex));
  }

  return content;
}

function ReportContent({ report }: { report: string }) {
  const blocks = useMemo(() => parseReport(report), [report]);

  return (
    <article className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <div
                key={`${block.type}-${index}`}
                className="border-b border-white/10 pb-3 pt-4 first:pt-0"
              >
                <h2 className="font-heading text-2xl text-white">
                  {readableLabel(block.text)}
                </h2>
              </div>
            );
          }

          if (block.level === 2) {
            return (
              <h3
                key={`${block.type}-${index}`}
                className="rounded-xl border border-[#f4c56a]/20 bg-[#f4c56a]/10 px-4 py-3 text-base font-semibold text-[#ffd696]"
              >
                {readableLabel(block.text)}
              </h3>
            );
          }

          return (
            <h4
              key={`${block.type}-${index}`}
              className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9fb0c3]"
            >
              {readableLabel(block.text)}
            </h4>
          );
        }

        if (block.type === "paragraph") {
          const isSourceLine = block.text.toLowerCase().startsWith("source:");

          return (
            <p
              key={`${block.type}-${index}`}
              className={`text-sm leading-7 ${
                isSourceLine
                  ? "rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 text-[#b7c3d4]"
                  : "text-[#d8e0ea]"
              }`}
            >
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`${block.type}-${index}`}
              className="space-y-2 rounded-xl border border-white/10 bg-[#0d1117] p-4"
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${item}-${itemIndex}`}
                  className="flex gap-3 text-sm leading-6 text-[#d8e0ea]"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4c56a]" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "table") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      {block.header.map((cell, cellIndex) => (
                        <th
                          key={`${cell}-${cellIndex}`}
                          className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9fb0c3]"
                        >
                          {readableLabel(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr
                        key={`${row.join("-")}-${rowIndex}`}
                        className="border-b border-white/5 last:border-0"
                      >
                        {block.header.map((_, cellIndex) => {
                          const value = row[cellIndex] ?? "";
                          const isScore =
                            /score|credibility/i.test(
                              block.header[cellIndex] ?? "",
                            ) || /^[01](\.\d+)?$/.test(value);

                          return (
                            <td
                              key={`${value}-${cellIndex}`}
                              className={`px-4 py-3 align-top leading-6 ${
                                cellIndex === 0
                                  ? "font-medium text-white"
                                  : isScore
                                    ? scoreColor(value)
                                    : "text-[#d8e0ea]"
                              }`}
                            >
                              {renderInline(readableLabel(value))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return (
          <div
            key={`${block.type}-${index}`}
            className="h-px w-full bg-white/10"
          />
        );
      })}
    </article>
  );
}

export function ReportViewer({ report, query }: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[#13171c]/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#8ca0b3]">
            Report
          </p>
          <h3 className="font-heading text-2xl text-white">Readable report</h3>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Tables, sources, and sections are formatted for scanning.
          </p>
        </div>

        {query ? (
          <div className="max-w-xs rounded-[1.25rem] border border-white/10 bg-[#0d1117] px-4 py-3 text-right text-xs text-[#b7c3d4]">
            {query}
          </div>
        ) : null}
      </div>

      {!report ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/10 px-6 py-14 text-center text-sm text-[#94a3b8]">
          No report loaded yet. Start a fresh run or reopen a cached history item.
        </div>
      ) : (
        <ReportContent report={report} />
      )}
    </section>
  );
}
