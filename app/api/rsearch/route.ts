import type { SerperResponse } from '@/types/search';
import { rSearchPrompt } from '@/lib/prompts';
import { createAiClient, getAiReasoningModel } from '@/lib/ai-provider';
import { buildSearchContext } from '@/lib/search-context';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const openai = createAiClient();

    const {
      searchTerm,
      searchResults,
      mode,
      refinedQuery,
    }: {
      searchTerm: string;
      searchResults: SerperResponse;
      mode: string;
      refinedQuery?: {
        query: string;
        explanation: string;
      };
    } = await req.json();

    const currentDate = new Date().toISOString().split('T')[0];
    const context = buildSearchContext(searchTerm, searchResults, mode, refinedQuery);
    const prompt = rSearchPrompt(searchTerm, context, currentDate);
    const model = getAiReasoningModel();

    const response = await openai.chat.completions.create({
      model: model as string,
      messages: [
        { role: 'user', content: prompt },
        { role: 'user', content: searchTerm },
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const newChunk = chunk.choices[0]?.delta;
            controller.enqueue(new TextEncoder().encode(`${JSON.stringify(newChunk)}\n`));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
