import type { BettingProvider } from "./provider";
import type { ProviderQuote } from "./types";

type HttpProviderOptions = {
  id: string;
  name: string;
  kind: BettingProvider["kind"];
  url: string;
  headers?: Record<string, string>;
};

function validateQuote(
  quote: unknown,
  providerId: string
): ProviderQuote {
  if (!quote || typeof quote !== "object") {
    throw new Error(`${providerId}: invalid quote`);
  }

  const value = quote as Partial<ProviderQuote>;

  if (
    typeof value.id !== "string" ||
    typeof value.eventId !== "string" ||
    typeof value.event !== "string" ||
    typeof value.market !== "string" ||
    typeof value.selection !== "string" ||
    (value.side !== "BACK" && value.side !== "LAY") ||
    typeof value.odds !== "number" ||
    !Number.isFinite(value.odds) ||
    typeof value.timestamp !== "string"
  ) {
    throw new Error(`${providerId}: invalid quote schema`);
  }

  if (value.odds <= 1) {
    throw new Error(`${providerId}: odds must be greater than 1`);
  }

  if (
    value.side === "BACK" &&
    !value.bookmakerId
  ) {
    throw new Error(`${providerId}: BACK quote missing bookmakerId`);
  }

  if (
    value.side === "LAY" &&
    !value.exchangeId
  ) {
    throw new Error(`${providerId}: LAY quote missing exchangeId`);
  }

  return {
    ...value,
    sourceProviderId: providerId,
  } as ProviderQuote;
}

export function createHttpProvider(
  options: HttpProviderOptions
): BettingProvider {
  return {
    id: options.id,
    name: options.name,
    kind: options.kind,

    async getQuotes(signal) {
      const response = await fetch(options.url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...options.headers,
        },
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `${options.id}: HTTP ${response.status}`
        );
      }

      const payload: unknown = await response.json();

      if (!Array.isArray(payload)) {
        throw new Error(
          `${options.id}: API response must be an array`
        );
      }

      return payload.map((quote) =>
        validateQuote(quote, options.id)
      );
    },
  };
}
