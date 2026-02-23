import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  listSets,
  listSetsWithInfo,
  getSet,
  getMergedSets,
  writeSet,
  deleteSet,
} from "./file-store.js";

let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), "rules-test-"));
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe("listSets", () => {
  it("returns an empty array for an empty directory", async () => {
    const sets = await listSets(testDir);
    expect(sets).toEqual([]);
  });

  it("returns sorted set names without .md extension", async () => {
    await writeSet(testDir, "typescript", "# TS");
    await writeSet(testDir, "general", "# General");

    const sets = await listSets(testDir);
    expect(sets).toEqual(["general", "typescript"]);
  });
});

describe("listSetsWithInfo", () => {
  it("returns set info with rule counts and timestamps", async () => {
    await writeSet(
      testDir,
      "test-rules",
      "# Test\n\n- Rule one.\n- Rule two.\n- Rule three.\n"
    );

    const infos = await listSetsWithInfo(testDir);
    expect(infos).toHaveLength(1);
    expect(infos[0].name).toBe("test-rules");
    expect(infos[0].ruleCount).toBe(3);
    expect(infos[0].lastModified).toBeTruthy();
  });
});

describe("getSet", () => {
  it("returns null for a non-existent set", async () => {
    const content = await getSet(testDir, "nonexistent");
    expect(content).toBeNull();
  });

  it("returns the content of an existing set", async () => {
    const markdown = "# My Rules\n\n- Be kind.\n";
    await writeSet(testDir, "my-rules", markdown);

    const content = await getSet(testDir, "my-rules");
    expect(content).toBe(markdown);
  });
});

describe("getMergedSets", () => {
  it("returns null if any requested set is missing", async () => {
    await writeSet(testDir, "existing", "# Existing\n- Rule.\n");

    const result = await getMergedSets(testDir, ["existing", "missing"]);
    expect(result).toBeNull();
  });

  it("returns null for an empty set list", async () => {
    const result = await getMergedSets(testDir, []);
    expect(result).toBeNull();
  });

  it("merges multiple sets with double newlines", async () => {
    await writeSet(testDir, "a", "# A\n\n- Rule A.");
    await writeSet(testDir, "b", "# B\n\n- Rule B.");

    const result = await getMergedSets(testDir, ["a", "b"]);
    expect(result).toBe("# A\n\n- Rule A.\n\n# B\n\n- Rule B.");
  });
});

describe("writeSet", () => {
  it("creates a new file with the given content", async () => {
    const markdown = "# New Rules\n\n- First rule.\n";
    await writeSet(testDir, "new-set", markdown);

    const filePath = join(testDir, "new-set.md");
    const content = await readFile(filePath, "utf-8");
    expect(content).toBe(markdown);
  });

  it("overwrites an existing file", async () => {
    await writeSet(testDir, "overwrite", "# Old");
    await writeSet(testDir, "overwrite", "# New");

    const content = await getSet(testDir, "overwrite");
    expect(content).toBe("# New");
  });
});

describe("deleteSet", () => {
  it("returns false for a non-existent set", async () => {
    const result = await deleteSet(testDir, "nonexistent");
    expect(result).toBe(false);
  });

  it("deletes an existing set and returns true", async () => {
    await writeSet(testDir, "to-delete", "# Delete me");

    const result = await deleteSet(testDir, "to-delete");
    expect(result).toBe(true);

    const content = await getSet(testDir, "to-delete");
    expect(content).toBeNull();
  });
});
