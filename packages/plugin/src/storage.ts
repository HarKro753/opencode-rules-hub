import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const LOCAL_RULES_FILE = ".opencode/rules-local.md";

export async function readLocalRules(
  projectDir: string
): Promise<string | null> {
  const filePath = join(projectDir, LOCAL_RULES_FILE);

  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function writeLocalRules(
  projectDir: string,
  content: string
): Promise<void> {
  const filePath = join(projectDir, LOCAL_RULES_FILE);
  await writeFile(filePath, content, "utf-8");
}
