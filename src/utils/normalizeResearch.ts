import { ResearchData } from "../types/research";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean).join(" ");
  }

  return String(value ?? "").trim();
}

function normalizeEvidenceArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = isRecord(item) ? item : {};

      return {
        text: normalizeText(record.text),
        source: normalizeText(record.source),
        title: normalizeText(record.title),
      };
    })
    .filter((item) => item.text && item.source);
}

export function normalizeResearchData(data: unknown): ResearchData {
  const record = isRecord(data) ? data : {};

  const duplicatesRemoved = Number(record.duplicatesRemoved ?? 0);

  return {
    claims: normalizeEvidenceArray(record.claims),
    quotes: normalizeEvidenceArray(record.quotes),
    statistics: normalizeEvidenceArray(record.statistics),
    duplicatesRemoved: Number.isFinite(duplicatesRemoved) ? duplicatesRemoved : 0,
  };
}
