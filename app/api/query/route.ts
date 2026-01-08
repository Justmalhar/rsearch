import { refineSearchQueryPrompt } from '@/lib/prompts';
import OpenAI from 'openai';
import { z } from 'zod';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RefinedSearchSchema = z.object({
  refined_query: z.string(),
  explanation: z.string(),
});

export async function POST(req: Request) {
  try {
    const { searchTerm, mode, contextTerm } = await req.json();

    // Create OpenAI client at runtime to avoid build-time evaluation
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY,
      baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL,
    });

    const currentDate = new Date().toISOString().split('T')[0];

    const prompt = refineSearchQueryPrompt(searchTerm, mode, currentDate);

    const model = process.env.NEXT_PUBLIC_AI_REFINER_MODEL;

    // Add context information if this is a follow-up question
    const userMessage = contextTerm
      ? `Original search: "${contextTerm}"\nFollow-up question: ${searchTerm}`
      : searchTerm;

    const response = await openai.chat.completions.create({
      model: model as string,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const refinedSearch = JSON.parse(content);

    // Validate the response against our schema
    const validatedResponse = RefinedSearchSchema.parse(refinedSearch);

    return new Response(JSON.stringify(validatedResponse), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Search refinement error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to refine search query',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}