import type { BettingProvider } from "./provider";
import { createHttpProvider } from "./httpProvider";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getConfiguredProviders(): BettingProvider[] {
  const url = process.env.MATCHBET_QUOTES_API_URL;

  if (!url) {
    return [];
  }

  const apiKey = process.env.MATCHBET_QUOTES_API_KEY;
  const authHeader =
    process.env.MATCHBET_QUOTES_API_AUTH_HEADER ||
    "Authorization";

  const headers: Record<string, string> = {};

  if (apiKey) {
    headers[authHeader] =
      authHeader.toLowerCase() === "authorization"
        ? `Bearer ${apiKey}`
        : apiKey;
  }

  return [
    createHttpProvider({
      id:
        process.env.MATCHBET_QUOTES_PROVIDER_ID ||
        "configured-quotes-api",
      name:
        process.env.MATCHBET_QUOTES_PROVIDER_NAME ||
        "Configured Quotes API",
      kind: "AGGREGATOR",
      url: requiredEnv("MATCHBET_QUOTES_API_URL"),
      headers,
    }),
  ];
}
