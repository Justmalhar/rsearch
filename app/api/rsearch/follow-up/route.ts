import OpenAI from 'openai';
import type { 
  SerperResponse, 
  SearchResult
} from '@/types/search';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY,
      baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL,
    });

    const { 
      followUpQuestion,
      originalSearchTerm,
      originalSources,
      originalAiResponse,
      newSources,
      knowledgeGraph,
      refinedQuery,
      originalRefinedQuery
    }: { 
      followUpQuestion: string;
      originalSearchTerm: string;
      originalSources: SearchResult[];
      originalAiResponse: string;
      newSources: SearchResult[];
      knowledgeGraph?: SerperResponse['knowledgeGraph'];
      refinedQuery?: {
        query: string;
        explanation: string;
      };
      originalRefinedQuery?: {
        query: string;
        explanation: string;
      };
    } = await req.json();
  
    // Create comprehensive context combining original and new information
    let context = '';

    // Add original context
    context += `### Original Search Context\n`;
    context += `Original Query: ${originalSearchTerm}\n`;
    if (originalRefinedQuery) {
      context += `Original Refined Query: ${originalRefinedQuery.query}\n`;
    }
    context += `Original AI Response Summary: ${originalAiResponse.substring(0, 500)}...\n\n`;

    // Add follow-up context
    context += `### Follow-up Question Context\n`;
    context += `Follow-up Question: ${followUpQuestion}\n`;
    if (refinedQuery) {
      context += `Refined Follow-up Query: ${refinedQuery.query}\n`;
      context += `Query Explanation: ${refinedQuery.explanation}\n`;
    }

    // Add knowledge graph if available
    if (knowledgeGraph) {
      const kg = knowledgeGraph;
      context += `\n### Knowledge Graph\n`;
      context += `Title: ${kg.title}\n`;
      context += `Type: ${kg.type}\n`;
      if (kg.description) context += `Description: ${kg.description}\n`;
      if (kg.attributes) {
        context += 'Attributes:\n';
        for (const [key, value] of Object.entries(kg.attributes)) {
          context += `- ${key}: ${value}\n`;
        }
      }
    }

    // Add new sources from follow-up search
    if (newSources.length > 0) {
      context += `\n### New Search Results for Follow-up\n`;
      newSources.forEach((result, index) => {
        context += `${index + 1}. **${result.title}**\n`;
        context += `   URL: ${result.link}\n`;
        if ('snippet' in result && result.snippet) {
          context += `   Content: ${result.snippet}\n`;
        }
        context += '\n';
      });
    }

    // Add relevant original sources for reference
    if (originalSources.length > 0) {
      context += `\n### Original Search Results (for reference)\n`;
      originalSources.slice(0, 5).forEach((result, index) => {
        context += `${index + 1}. **${result.title}**\n`;
        context += `   URL: ${result.link}\n`;
        if ('snippet' in result && result.snippet) {
          context += `   Content: ${result.snippet.substring(0, 200)}...\n`;
        }
        context += '\n';
      });
    }

    const followUpPrompt = `You are a helpful AI research assistant providing follow-up answers to user questions. 

The user originally searched for "${originalSearchTerm}" and now has a follow-up question: "${followUpQuestion}".

Based on the provided context below, provide a comprehensive, well-researched answer to the follow-up question. Your response should:

1. **Build upon the original search context** - Reference and connect to the previous findings when relevant
2. **Focus on the new question** - Directly address what the user is asking about
3. **Integrate new and old information** - Combine insights from both the original search and new search results
4. **Provide specific details** - Include relevant data, examples, and evidence from the sources
5. **Maintain continuity** - Show how this follow-up relates to or expands upon the original topic

Format your response as a clear, well-structured article with appropriate headings and bullet points where helpful. Make sure to:
- Start with a brief connection to the original query if relevant
- Provide a direct answer to the follow-up question
- Support your answer with evidence from the sources
- Include specific examples and details
- Conclude with any additional insights or implications

**Research Context:**
${context}

Please provide a comprehensive response to the follow-up question: "${followUpQuestion}"`;

    const stream = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI research assistant that provides comprehensive, well-researched answers based on search results and context. Always cite information from the provided sources and maintain a professional, informative tone.'
        },
        {
          role: 'user',
          content: followUpPrompt
        }
      ],
      stream: true,
      temperature: 0.2,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Send reasoning and content in the same format as the main rsearch
              const data = JSON.stringify({ content }) + '\n';
              controller.enqueue(encoder.encode(data));
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Follow-up API Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your follow-up question' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}