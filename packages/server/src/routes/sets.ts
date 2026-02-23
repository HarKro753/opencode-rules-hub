import { Router } from "express";
import { listSets, listSetsWithInfo } from "../storage/file-store.js";

export function createSetsRouter(dataDir: string): Router {
  const router = Router();

  router.get("/sets", async (_req, res) => {
    try {
      const sets = await listSetsWithInfo(dataDir);
      res.json(sets);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to list sets";
      res.status(500).json({ error: message });
    }
  });

  return router;
}
