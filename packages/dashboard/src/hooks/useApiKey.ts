"use client";

import { useState, useCallback, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("rules-hub-api-key") ?? "";
    setApiKeyState(stored);
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem("rules-hub-api-key", key);
    setApiKeyState(key);
  }, []);

  return { apiKey, setApiKey };
}
