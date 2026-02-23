"use client";

import { useApiKey } from "@/hooks/useApiKey";

export function ApiKeyBar() {
  const { apiKey, setApiKey } = useApiKey();

  return (
    <div className="api-key-bar">
      <label htmlFor="api-key">API Key:</label>
      <input
        id="api-key"
        type="password"
        placeholder="Enter API key for write operations"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
    </div>
  );
}
