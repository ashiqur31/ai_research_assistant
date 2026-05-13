type Evidience = {
  text: string;
  source: string;
  title: string;
};

export function deDuplicateEvidience(items: Evidience[]): Evidience[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = item.text
      .toLocaleLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}
