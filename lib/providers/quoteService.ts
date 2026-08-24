import { getConfiguredProviders } from "./registry";
import type { ProviderQuote } from "./types";

export async function getLiveQuotes(): Promise<{
  providerId: string;
  providerName: string;
  quotes: ProviderQuote[];
}> {
  const providers = getConfiguredProviders();

  if (providers.length === 0) {
    throw new Error("QUOTE_PROVIDER_NOT_CONFIGURED");
  }

  const results = await Promise.all(
    providers.map(async (provider) => ({
      provider,
      quotes: await provider.getQuotes(),
    }))
  );

  return {
    providerId: results.map((item) => item.provider.id).join(","),
    providerName: results
      .map((item) => item.provider.name)
      .join(", "),
    quotes: results.flatMap((item) => item.quotes),
  };
}
