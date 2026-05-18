export function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}
