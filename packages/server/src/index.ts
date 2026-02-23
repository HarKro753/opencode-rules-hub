import express from "express";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { createHealthRouter } from "./routes/health.js";
import { createSetsRouter } from "./routes/sets.js";
import { createRulesRouter } from "./routes/rules.js";

const PORT = parseInt(process.env.PORT ?? "3847", 10);
const API_KEY = process.env.API_KEY ?? "changeme";
const DATA_DIR = resolve(process.env.DATA_DIR ?? "./data");

async function main(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  const app = express();

  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (_req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.text({ type: "text/*" }));
  app.use(express.text({ type: "application/json" }));

  app.use(createHealthRouter());
  app.use(createSetsRouter(DATA_DIR));
  app.use(createRulesRouter(DATA_DIR, API_KEY));

  app.listen(PORT, () => {
    console.log(`Rules server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
