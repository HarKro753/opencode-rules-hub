import { Router } from "express";
import {
  getSet,
  getMergedSets,
  writeSet,
  deleteSet,
} from "../storage/file-store.js";
import { createApiKeyMiddleware } from "../auth/api-key.js";

const SET_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

function isValidSetName(name: string): boolean {
  return SET_NAME_PATTERN.test(name);
}

export function createRulesRouter(dataDir: string, apiKey: string): Router {
  const router = Router();
  const requireAuth = createApiKeyMiddleware(apiKey);

  router.get("/rules", async (req, res) => {
    const setsParam = req.query.sets;

    if (!setsParam || typeof setsParam !== "string") {
      res.status(400).json({ error: "Query parameter 'sets' is required" });
      return;
    }

    const setNames = setsParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (setNames.length === 0) {
      res.status(400).json({ error: "No valid set names provided" });
      return;
    }

    try {
      const merged = await getMergedSets(dataDir, setNames);

      if (merged === null) {
        res.status(404).json({ error: "One or more requested sets not found" });
        return;
      }

      res.type("text/markdown").send(merged);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch rules";
      res.status(500).json({ error: message });
    }
  });

  router.get("/rules/:set", async (req, res) => {
    const setName = req.params.set;

    if (!isValidSetName(setName)) {
      res.status(400).json({ error: "Invalid set name. Use alphanumeric characters, hyphens, and underscores only." });
      return;
    }

    try {
      const content = await getSet(dataDir, setName);

      if (content === null) {
        res.status(404).json({ error: `Rule set '${setName}' not found` });
        return;
      }

      res.type("text/markdown").send(content);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch rule set";
      res.status(500).json({ error: message });
    }
  });

  router.post("/rules/:set", requireAuth, async (req, res) => {
    const setName = req.params.set;

    if (!isValidSetName(setName)) {
      res.status(400).json({ error: "Invalid set name. Use alphanumeric characters, hyphens, and underscores only." });
      return;
    }

    const body = req.body;

    if (typeof body !== "string" || body.trim().length === 0) {
      res.status(400).json({ error: "Request body must be non-empty markdown text" });
      return;
    }

    try {
      await writeSet(dataDir, setName, body);
      res.status(201).json({ message: `Rule set '${setName}' created` });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create rule set";
      res.status(500).json({ error: message });
    }
  });

  router.put("/rules/:set", requireAuth, async (req, res) => {
    const setName = req.params.set;

    if (!isValidSetName(setName)) {
      res.status(400).json({ error: "Invalid set name. Use alphanumeric characters, hyphens, and underscores only." });
      return;
    }

    const body = req.body;

    if (typeof body !== "string" || body.trim().length === 0) {
      res.status(400).json({ error: "Request body must be non-empty markdown text" });
      return;
    }

    try {
      await writeSet(dataDir, setName, body);
      res.json({ message: `Rule set '${setName}' updated` });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update rule set";
      res.status(500).json({ error: message });
    }
  });

  router.delete("/rules/:set", requireAuth, async (req, res) => {
    const setName = req.params.set;

    if (!isValidSetName(setName)) {
      res.status(400).json({ error: "Invalid set name. Use alphanumeric characters, hyphens, and underscores only." });
      return;
    }

    try {
      const deleted = await deleteSet(dataDir, setName);

      if (!deleted) {
        res.status(404).json({ error: `Rule set '${setName}' not found` });
        return;
      }

      res.json({ message: `Rule set '${setName}' deleted` });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete rule set";
      res.status(500).json({ error: message });
    }
  });

  return router;
}
