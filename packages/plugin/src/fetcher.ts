import type { RulesConfig } from "./config.js";

export async function fetchRulesFromServer(
  config: RulesConfig
): Promise<string> {
  const setsParam = config.sets.join(",");
  const url = `${config.server}/rules?sets=${encodeURIComponent(setsParam)}`;

  const res = await fetch(url, {
    headers: {
      Accept: "text/markdown",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch rules from ${config.server}: ${res.status} ${res.statusText}`
    );
  }

  return res.text();
}
