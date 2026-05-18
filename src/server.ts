import express from "express";
import cors from "cors";
import researchRoutes from "./routes/researchRoutes";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const app = express();

const corsOptions =
  env.corsOrigins.length > 0
    ? {
        origin: env.corsOrigins,
      }
    : undefined;

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "research-assistant-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/research", researchRoutes);

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, "API server is running");
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "Shutting down API server");

  server.close((error) => {
    if (error) {
      logger.error({ error }, "API server shutdown failed");
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
