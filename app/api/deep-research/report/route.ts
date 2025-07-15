import OpenAI from 'openai';
import type { SearchResult, SearchSource } from '@/types/search';

// Make sure to export these properly for Next.js API routes
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ResearchStep {
  id: string;
  query: string;
  mode: SearchSource;
  results: SearchResult[];
  status: string;
}

const deepResearchReportPrompt = (
  query: string, 
  researchPlan: ResearchStep[], 
  allResults: SearchResult[], 
  mode: SearchSource
) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Create a comprehensive context from all search results
  let context = `# Deep Research Report Generation

## Original Query
${query}

## Research Strategy
The following research plan was executed to provide comprehensive coverage:

${researchPlan.map((step, index) => `
### Step ${index + 1}: ${step.mode.toUpperCase()} Search
**Query:** ${step.query}
**Results Found:** ${step.results.length}
**Status:** ${step.status}

${step.results.slice(0, 5).map((result, resultIndex) => `
${resultIndex + 1}. **${result.title}**
   - Source: ${result.link}
   - ${result.snippet || 'No snippet available'}
`).join('')}
${step.results.length > 5 ? `... and ${step.results.length - 5} more results` : ''}
`).join('')}

## Total Sources Analyzed
${allResults.length} total search results across ${researchPlan.length} different search queries.

## Current Date
${currentDate}

## Instructions
You are an expert research analyst. Your task is to create a comprehensive, well-structured report that synthesizes all the information gathered from the multiple search queries above.

Create a detailed report that:
1. **Provides a comprehensive overview** of the topic based on all sources
2. **Identifies key themes and patterns** across the different search results
3. **Presents multiple perspectives** when different sources offer conflicting information
4. **Includes specific details and examples** from the source material
5. **Organizes information logically** with clear sections and subsections
6. **Draws meaningful conclusions** based on the comprehensive data gathered
7. **Cites specific sources** when making important claims or presenting specific information

The report should be thorough, well-reasoned, and provide deep insights that would not be possible from a single search query. Use markdown formatting for structure and readability.

Focus on providing actionable insights and comprehensive understanding rather than just summarizing individual sources.`;

  return context;
};

export async function POST(req: Request) {
  try {
    // Create OpenAI client at runtime to avoid build-time evaluation
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY,
      baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL,
    });

    const { 
      query, 
      researchPlan, 
      allResults, 
      mode 
    }: { 
      query: string; 
      researchPlan: ResearchStep[];
      allResults: SearchResult[];
      mode: SearchSource;
    } = await req.json();

    if (!query || !researchPlan || !allResults) {
      return new Response(
        JSON.stringify({ error: 'Query, research plan, and results are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = deepResearchReportPrompt(query, researchPlan, allResults, mode);
    const model = process.env.NEXT_PUBLIC_AI_REASONING_MODEL;

    const response = await openai.chat.completions.create({
      model: model as string,
      messages: [
        { 
          role: "system", 
          content: "You are an expert research analyst who creates comprehensive, well-structured reports based on multiple sources of information. Focus on synthesis, analysis, and providing deep insights rather than just summarizing individual sources." 
        },
        { role: "user", content: prompt }
      ],
      stream: true,
    });

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const newChunk = chunk.choices[0]?.delta;
                    
            // Send the entire chunk object as JSON
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
    console.error('Deep research report generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate research report',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}