type Evidence = {
  text: string;
  source: string;
  title: string;
};

export function deDuplicateEvidence(items: Evidence[]): Evidence[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalized = item.text.toLowerCase().trim().replace(/\s+/g, " ");

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export const deDuplicateEvidience = deDuplicateEvidence;
