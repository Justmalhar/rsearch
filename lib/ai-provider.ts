import 'server-only';
import OpenAI from 'openai';

/**
 * Server-only AI provider config. Do not import from client components.
 *
 * Required (one of):
 *   AI_PROVIDER_API_KEY
 *   OPENROUTER_API_KEY
 *
 * Optional:
 *   AI_PROVIDER_BASE_URL
 *   AI_REFINER_MODEL
 *   AI_REASONING_MODEL
 *
 * NEXT_PUBLIC_AI_PROVIDER_API_KEY is intentionally not read. That prefix
 * inlines the secret into the browser bundle. Copy the value to
 * AI_PROVIDER_API_KEY (or OPENROUTER_API_KEY) on the host.
 *
 * Model names and the base URL are not secrets; NEXT_PUBLIC_* aliases are
 * still accepted so existing Vercel env for those continues to work.
 */
export function getAiProviderApiKey(): string | undefined {
  return process.env.AI_PROVIDER_API_KEY || process.env.OPENROUTER_API_KEY;
}

export function getAiProviderBaseURL(): string | undefined {
  const explicit =
    process.env.AI_PROVIDER_BASE_URL ||
    process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL;

  if (explicit) return explicit;

  // Chat/image already use OpenRouter. If that is the only key present,
  // default to OpenRouter's OpenAI-compatible endpoint.
  if (!process.env.AI_PROVIDER_API_KEY && process.env.OPENROUTER_API_KEY) {
    return 'https://openrouter.ai/api/v1';
  }

  return undefined;
}

export function getAiRefinerModel(): string | undefined {
  return process.env.AI_REFINER_MODEL || process.env.NEXT_PUBLIC_AI_REFINER_MODEL;
}

export function getAiReasoningModel(): string | undefined {
  return process.env.AI_REASONING_MODEL || process.env.NEXT_PUBLIC_AI_REASONING_MODEL;
}

export function createAiClient(): OpenAI {
  const apiKey = getAiProviderApiKey();
  if (!apiKey) {
    throw new Error(
      'AI provider API key is not configured. Set AI_PROVIDER_API_KEY or OPENROUTER_API_KEY (server-side, not NEXT_PUBLIC_).'
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: getAiProviderBaseURL(),
  });
}
