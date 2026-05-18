export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001").replace(
    /\/$/,
    "",
  );

export const RESEARCH_ENDPOINT = `${API_BASE_URL}/research`;
