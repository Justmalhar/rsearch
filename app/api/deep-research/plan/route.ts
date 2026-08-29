import type { SearchSource } from '@/types/search';
import { createAiClient, getAiReasoningModel } from '@/lib/ai-provider';

// Make sure to export these properly for Next.js API routes
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ResearchStep {
  id: string;
  query: string;
  mode: SearchSource;
  reasoning: string;
}

const deepResearchPlanPrompt = (query: string, mode: SearchSource) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
You are an expert research strategist. Your task is to break down a complex research query into multiple focused sub-queries that will provide comprehensive coverage of the topic.

Current Date: ${currentDate}
Original Query: "${query}"
Primary Search Mode: ${mode}

Generate 3-5 focused sub-queries that will help gather comprehensive information about this topic. Each sub-query should:
1. Focus on a specific aspect or angle of the main query
2. Use different search modes when appropriate (web, news, scholar, etc.)
3. Be specific enough to yield relevant results
4. Cover different perspectives or time periods if relevant
5. Consider the current date (${currentDate}) when suggesting time-sensitive searches

For each sub-query, provide:
- A clear, focused search query
- The most appropriate search mode (web, news, scholar, patents, etc.)
- Brief reasoning for why this sub-query is important

Return your response as a JSON array with this exact structure:
[
  {
    "id": "step_1",
    "query": "specific search query here",
    "mode": "web|news|scholar|patents|images|videos|shopping|places",
    "reasoning": "brief explanation of why this search is important"
  }
]

Make sure the queries are diverse and will provide different types of information to create a comprehensive understanding of the topic. Consider including recent developments, current trends, or time-sensitive aspects when relevant to the query.
`;
};

export async function POST(req: Request) {
  try {
    const openai = createAiClient();

    const { query, mode }: { 
      query: string; 
      mode: SearchSource;
    } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = deepResearchPlanPrompt(query, mode);
    const model = getAiReasoningModel();

    const response = await openai.chat.completions.create({
      model: model as string,
      messages: [
        { role: "system", content: "You are an expert research strategist who creates focused, effective search plans." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    // Try to parse the JSON response
    let steps: ResearchStep[];
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        steps = JSON.parse(jsonMatch[0]);
      } else {
        steps = JSON.parse(content);
      }
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse research plan from AI response');
    }

    // Validate and clean the steps
    const validatedSteps = steps.map((step, index) => ({
      id: step.id || `step_${index + 1}`,
      query: step.query,
      mode: step.mode || mode, // fallback to original mode
      reasoning: step.reasoning || `Search for ${step.query}`
    }));

    return new Response(
      JSON.stringify({ 
        steps: validatedSteps,
        originalQuery: query,
        mode: mode
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Deep research plan generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate research plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}