import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface RulesConfig {
  server: string;
  apiKey: string;
  sets: string[];
}

const CONFIG_PATH = ".opencode/rules.json";

export async function readConfig(
  projectDir: string
): Promise<RulesConfig | null> {
  const filePath = join(projectDir, CONFIG_PATH);

  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);

    if (!isValidConfig(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isValidConfig(value: unknown): value is RulesConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj.server !== "string" || obj.server.length === 0) {
    return false;
  }

  if (typeof obj.apiKey !== "string") {
    return false;
  }

  if (!Array.isArray(obj.sets) || obj.sets.length === 0) {
    return false;
  }

  if (!obj.sets.every((s: unknown) => typeof s === "string")) {
    return false;
  }

  return true;
}
