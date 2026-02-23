import type { Request, Response, NextFunction } from "express";

export function createApiKeyMiddleware(apiKey: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or malformed Authorization header" });
      return;
    }

    const token = authHeader.slice("Bearer ".length);

    if (token !== apiKey) {
      res.status(403).json({ error: "Invalid API key" });
      return;
    }

    next();
  };
}
