import "dotenv/config";

function numberFromEnv(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function csvFromEnv(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberFromEnv("PORT", 3001),
  corsOrigins: csvFromEnv("CORS_ORIGINS"),
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST ?? "127.0.0.1",
  redisPort: numberFromEnv("REDIS_PORT", 6379),
  cacheTtlSeconds: numberFromEnv("RESEARCH_CACHE_TTL_SECONDS", 60 * 60 * 24),
  openaiApiKey: process.env.OPENAI_API_KEY,
  tavilyApiKey: process.env.TAVILY_API_KEY,
};

export const isProduction = env.nodeEnv === "production";
