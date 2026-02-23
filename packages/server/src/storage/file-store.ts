import { readdir, readFile, writeFile, unlink, stat } from "node:fs/promises";
import { join } from "node:path";

export interface RuleSetInfo {
  name: string;
  ruleCount: number;
  lastModified: string;
}

function countRules(content: string): number {
  return content
    .split("\n")
    .filter((line) => line.trim().startsWith("- ")).length;
}

function resolveSetPath(dataDir: string, setName: string): string {
  return join(dataDir, `${setName}.md`);
}

export async function listSets(dataDir: string): Promise<string[]> {
  const entries = await readdir(dataDir);
  return entries
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => entry.replace(/\.md$/, ""))
    .sort();
}

export async function listSetsWithInfo(
  dataDir: string
): Promise<RuleSetInfo[]> {
  const names = await listSets(dataDir);
  const infos: RuleSetInfo[] = [];

  for (const name of names) {
    const filePath = resolveSetPath(dataDir, name);
    const [content, fileStat] = await Promise.all([
      readFile(filePath, "utf-8"),
      stat(filePath),
    ]);
    infos.push({
      name,
      ruleCount: countRules(content),
      lastModified: fileStat.mtime.toISOString(),
    });
  }

  return infos;
}

export async function getSet(
  dataDir: string,
  setName: string
): Promise<string | null> {
  const filePath = resolveSetPath(dataDir, setName);
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function getMergedSets(
  dataDir: string,
  setNames: string[]
): Promise<string | null> {
  const results: string[] = [];

  for (const name of setNames) {
    const content = await getSet(dataDir, name);
    if (content === null) {
      return null;
    }
    results.push(content.trim());
  }

  if (results.length === 0) {
    return null;
  }

  return results.join("\n\n");
}

export async function writeSet(
  dataDir: string,
  setName: string,
  content: string
): Promise<void> {
  const filePath = resolveSetPath(dataDir, setName);
  await writeFile(filePath, content, "utf-8");
}

export async function deleteSet(
  dataDir: string,
  setName: string
): Promise<boolean> {
  const filePath = resolveSetPath(dataDir, setName);
  try {
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
