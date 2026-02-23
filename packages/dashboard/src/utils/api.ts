const SERVER_URL =
  process.env.NEXT_PUBLIC_RULES_SERVER_URL ?? "http://localhost:3847";

export interface RuleSetInfo {
  name: string;
  ruleCount: number;
  lastModified: string;
}

export async function fetchSets(): Promise<RuleSetInfo[]> {
  const res = await fetch(`${SERVER_URL}/sets`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch sets: ${res.statusText}`);
  }

  return res.json() as Promise<RuleSetInfo[]>;
}

export async function fetchSet(name: string): Promise<string> {
  const res = await fetch(`${SERVER_URL}/rules/${encodeURIComponent(name)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch set '${name}': ${res.statusText}`);
  }

  return res.text();
}

export async function saveSet(name: string, content: string): Promise<void> {
  const res = await fetch(`${SERVER_URL}/rules/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "text/markdown",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: content,
  });

  if (!res.ok) {
    throw new Error(`Failed to save set '${name}': ${res.statusText}`);
  }
}

export async function createSet(name: string, content: string): Promise<void> {
  const res = await fetch(`${SERVER_URL}/rules/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/markdown",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: content,
  });

  if (!res.ok) {
    throw new Error(`Failed to create set '${name}': ${res.statusText}`);
  }
}

export async function deleteSetRequest(name: string): Promise<void> {
  const res = await fetch(`${SERVER_URL}/rules/${encodeURIComponent(name)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete set '${name}': ${res.statusText}`);
  }
}

function getApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rules-hub-api-key") ?? "";
  }
  return "";
}

export function setApiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rules-hub-api-key", key);
  }
}

export function getStoredApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rules-hub-api-key") ?? "";
  }
  return "";
}
