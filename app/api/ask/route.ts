import { rSearchPrompt } from '@/lib/prompts';
import {
  createAiClient,
  getAiProviderApiKey,
  getAiReasoningModel,
} from '@/lib/ai-provider';
import { searchWithSerper, sourcesFromSerper, SerperConfigError, SerperRequestError } from '@/lib/serper';
import { buildSearchContext } from '@/lib/search-context';
import { encodeSseEvent, SSE_HEADERS } from '@/lib/sse';
import { refineSearchQuery } from '@/lib/refine-query';
import type { SearchSource, SerperResponse } from '@/types/search';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

type AskParams = {
  q: string;
  mode: SearchSource;
  refine: boolean;
};

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'false' || value === '0') return false;
    if (value === 'true' || value === '1') return true;
  }
  return fallback;
}

function parseAskParams(input: {
  q?: unknown;
  query?: unknown;
  searchTerm?: unknown;
  mode?: unknown;
  refine?: unknown;
}): AskParams | { error: string } {
  const q = [input.q, input.query, input.searchTerm]
    .find((value) => typeof value === 'string' && value.trim()) as string | undefined;

  if (!q) {
    return { error: 'Query is required. Pass JSON { "q": "..." } or ?q=' };
  }

  const mode = (typeof input.mode === 'string' && input.mode.trim()
    ? input.mode
    : 'web') as SearchSource;

  return {
    q: q.trim(),
    mode,
    refine: parseBoolean(input.refine, true),
  };
}

function collectNewCitations(
  text: string,
  seen: Set<string>
): Array<{ index: number; title: string; url: string }> {
  const found: Array<{ index: number; title: string; url: string }> = [];
  MARKDOWN_LINK_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKDOWN_LINK_RE.exec(text)) !== null) {
    const title = match[1];
    const url = match[2];
    if (seen.has(url)) continue;
    seen.add(url);
    found.push({ index: seen.size, title, url });
  }
  return found;
}

function jsonError(message: string, status: number, details?: string) {
  return new Response(
    JSON.stringify({ error: message, details }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

async function handleAsk(params: AskParams, signal: AbortSignal): Promise<Response> {
  if (!getAiProviderApiKey()) {
    return jsonError(
      'AI provider API key is not configured',
      500,
      'Set AI_PROVIDER_API_KEY or OPENROUTER_API_KEY (server-side). NEXT_PUBLIC_AI_PROVIDER_API_KEY is no longer used.'
    );
  }

  if (!process.env.SERPER_API_KEY) {
    return jsonError('Serper API key is not configured', 500, 'Set SERPER_API_KEY (server-side).');
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(encodeSseEvent(event, data)));
      };

      try {
        let refinedQuery: { query: string; explanation: string } | undefined;
        let searchQuery = params.q;

        if (params.refine) {
          try {
            refinedQuery = await refineSearchQuery(params.q, params.mode);
            searchQuery = refinedQuery.query;
          } catch (error) {
            console.error('Query refinement failed, using original query:', error);
          }
        }

        send('queries', {
          original: params.q,
          queries: [searchQuery],
          explanation: refinedQuery?.explanation,
        });

        let searchResults: SerperResponse;
        try {
          searchResults = await searchWithSerper(searchQuery, params.mode);
        } catch (error) {
          if (error instanceof SerperConfigError || error instanceof SerperRequestError) {
            send('error', { message: error.message });
            send('done', {});
            controller.close();
            return;
          }
          throw error;
        }

        send('sources', sourcesFromSerper(searchResults, params.mode));

        const model = getAiReasoningModel();
        if (!model) {
          send('error', {
            message: 'AI_REASONING_MODEL (or NEXT_PUBLIC_AI_REASONING_MODEL) is not configured',
          });
          send('done', {});
          controller.close();
          return;
        }

        const openai = createAiClient();
        const currentDate = new Date().toISOString().split('T')[0];
        const context = buildSearchContext(params.q, searchResults, params.mode, refinedQuery);
        const prompt = rSearchPrompt(params.q, context, currentDate);

        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: 'user', content: prompt },
            { role: 'user', content: params.q },
          ],
          stream: true,
        }, { signal });

        let answer = '';
        const seenUrls = new Set<string>();

        for await (const chunk of response) {
          if (signal.aborted) break;
          const delta = chunk.choices[0]?.delta as
            | { content?: string; reasoning_content?: string; reasoning?: string }
            | undefined;
          if (!delta) continue;

          const thinking = delta.reasoning_content || delta.reasoning;
          if (thinking) {
            send('thinking', { text: thinking });
          }

          if (delta.content) {
            answer += delta.content;
            send('token', { text: delta.content });
            for (const citation of collectNewCitations(answer, seenUrls)) {
              send('citation', citation);
            }
          }
        }

        if (seenUrls.size === 0) {
          const fallback = sourcesFromSerper(searchResults, params.mode).results;
          fallback.forEach((source, index) => {
            if (!source.url) return;
            send('citation', {
              index: index + 1,
              title: source.title,
              url: source.url,
            });
          });
        }

        const related = [
          ...(searchResults.relatedSearches?.map((item) => item.query) || []),
          ...(searchResults.peopleAlsoAsk?.map((item) => item.question) || []),
        ].filter(Boolean);

        if (related.length) {
          send('related', { queries: related });
        }

        send('done', {});
        controller.close();
      } catch (error) {
        console.error('/api/ask error:', error);
        try {
          controller.enqueue(encoder.encode(encodeSseEvent('error', {
            message: error instanceof Error ? error.message : 'Failed to generate response',
          })));
          controller.enqueue(encoder.encode(encodeSseEvent('done', {})));
        } catch {
          // stream already closed
        }
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const params = parseAskParams(body);
    if ('error' in params) {
      return jsonError(params.error, 400);
    }
    return handleAsk(params, req.signal);
  } catch (error) {
    return jsonError(
      'Failed to start /api/ask',
      500,
      error instanceof Error ? error.message : undefined
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = parseAskParams({
    q: url.searchParams.get('q') ?? undefined,
    query: url.searchParams.get('query') ?? undefined,
    mode: url.searchParams.get('mode') ?? undefined,
    refine: url.searchParams.get('refine') ?? undefined,
  });
  if ('error' in params) {
    return jsonError(params.error, 400);
  }
  return handleAsk(params, req.signal);
}
