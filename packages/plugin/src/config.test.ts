import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readConfig } from "./config.js";

let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), "rules-config-test-"));
  await mkdir(join(testDir, ".opencode"), { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe("readConfig", () => {
  it("returns null when config file does not exist", async () => {
    const config = await readConfig(testDir + "/nonexistent");
    expect(config).toBeNull();
  });

  it("returns null for invalid JSON", async () => {
    await writeFile(
      join(testDir, ".opencode/rules.json"),
      "not json",
      "utf-8"
    );

    const config = await readConfig(testDir);
    expect(config).toBeNull();
  });

  it("returns null when server field is missing", async () => {
    await writeFile(
      join(testDir, ".opencode/rules.json"),
      JSON.stringify({ apiKey: "key", sets: ["ts"] }),
      "utf-8"
    );

    const config = await readConfig(testDir);
    expect(config).toBeNull();
  });

  it("returns null when sets array is empty", async () => {
    await writeFile(
      join(testDir, ".opencode/rules.json"),
      JSON.stringify({
        server: "http://localhost:3847",
        apiKey: "key",
        sets: [],
      }),
      "utf-8"
    );

    const config = await readConfig(testDir);
    expect(config).toBeNull();
  });

  it("returns null when sets contains non-string values", async () => {
    await writeFile(
      join(testDir, ".opencode/rules.json"),
      JSON.stringify({
        server: "http://localhost:3847",
        apiKey: "key",
        sets: [123],
      }),
      "utf-8"
    );

    const config = await readConfig(testDir);
    expect(config).toBeNull();
  });

  it("parses a valid config file", async () => {
    const expected = {
      server: "http://localhost:3847",
      apiKey: "test-key",
      sets: ["typescript", "general"],
    };

    await writeFile(
      join(testDir, ".opencode/rules.json"),
      JSON.stringify(expected),
      "utf-8"
    );

    const config = await readConfig(testDir);
    expect(config).toEqual(expected);
  });
});
