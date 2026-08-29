import 'server-only';
import { z } from 'zod';
import { createAiClient, getAiRefinerModel } from '@/lib/ai-provider';
import { refineSearchQueryPrompt } from '@/lib/prompts';

const RefinedSearchSchema = z.object({
  refined_query: z.string(),
  explanation: z.string(),
});

export type RefinedQuery = {
  query: string;
  explanation: string;
};

export async function refineSearchQuery(
  searchTerm: string,
  mode: string,
  contextTerm?: string
): Promise<RefinedQuery> {
  const openai = createAiClient();
  const model = getAiRefinerModel();
  if (!model) {
    throw new Error('AI_REFINER_MODEL (or NEXT_PUBLIC_AI_REFINER_MODEL) is not configured');
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = refineSearchQueryPrompt(searchTerm, mode, currentDate);
  const userMessage = contextTerm
    ? `Original search: "${contextTerm}"\nFollow-up question: ${searchTerm}`
    : searchTerm;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    max_completion_tokens: 500,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from AI provider');
  }

  const validated = RefinedSearchSchema.parse(JSON.parse(content));
  return {
    query: validated.refined_query,
    explanation: validated.explanation,
  };
}
