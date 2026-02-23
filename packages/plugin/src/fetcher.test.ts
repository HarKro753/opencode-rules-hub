import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchRulesFromServer } from "./fetcher.js";
import type { RulesConfig } from "./config.js";

const mockConfig: RulesConfig = {
  server: "http://localhost:3847",
  apiKey: "test-key",
  sets: ["typescript", "general"],
};

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("fetchRulesFromServer", () => {
  it("fetches merged rules from the server", async () => {
    const mockRules = "# TypeScript Rules\n\n- Rule 1.\n\n# General Rules\n\n- Rule 2.";

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockRules),
    });

    const result = await fetchRulesFromServer(mockConfig);
    expect(result).toBe(mockRules);

    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = fetchCall[0] as string;
    expect(url).toContain("/rules?sets=");
    expect(url).toContain("typescript");
    expect(url).toContain("general");
  });

  it("throws on non-ok response", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchRulesFromServer(mockConfig)).rejects.toThrow(
      "Failed to fetch rules"
    );
  });

  it("encodes set names in the URL", async () => {
    const configWithSpecialChars: RulesConfig = {
      server: "http://localhost:3847",
      apiKey: "key",
      sets: ["my-rules", "other_rules"],
    };

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("# Rules"),
    });

    await fetchRulesFromServer(configWithSpecialChars);

    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const url = fetchCall[0] as string;
    expect(url).toContain("my-rules");
    expect(url).toContain("other_rules");
  });
});
