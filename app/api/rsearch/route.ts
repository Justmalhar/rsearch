import OpenAI from 'openai';
import type { 
  SerperResponse, 
  WebSearchResult,
  ImageSearchResult,
  VideoSearchResult,
  NewsSearchResult,
  ShoppingSearchResult
} from '@/types/search';
import { rSearchPrompt } from '@/lib/prompts';

// Make sure to export these properly for Next.js API routes
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    // Create OpenAI client at runtime to avoid build-time evaluation
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY,
      baseURL: process.env.NEXT_PUBLIC_AI_PROVIDER_BASE_URL,
    });

    const { 
      searchTerm, 
      searchResults,
      mode,
      refinedQuery
    }: { 
      searchTerm: string; 
      searchResults: SerperResponse;
      mode: string;
      refinedQuery?: {
        query: string;
        explanation: string;
      };
    } = await req.json();
  
    // Create a comprehensive context from search results
    let context = '';

    // Add knowledge graph info if available
    if (searchResults.knowledgeGraph) {
      const kg = searchResults.knowledgeGraph;
      context += `### Knowledge Graph\nTitle: ${kg.title}\nType: ${kg.type}${kg.description ? `\nDescription: ${kg.description}` : ''}\n`;
      if (kg.attributes) {
        context += 'Attributes:\n';
        for (const [key, value] of Object.entries(kg.attributes)) {
          context += `- ${key}: ${value}\n`;
        }
      }
      // Add any images from knowledge graph
      if (kg.images?.length) {
        context += 'Images:\n';
        for (const image of kg.images) {
          context += `- ${image.title || 'Image'}: ${image.imageUrl}\n`;
        }
      }
      context += '\n';
    }

    // Add organic search results
    if (searchResults.organic?.length) {
      context += '### Organic Results\n';
      context += searchResults.organic.map((result: WebSearchResult, index: number) => {
        return `[${index + 1}] ${result.title}
Source: ${result.link}
${result.snippet}
${result.date ? `Date: ${result.date}\n` : ''}${result.attributes ? `Attributes:
${Object.entries(result.attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n` : ''}${result.imageUrl ? `Image: ${result.imageUrl}\n` : ''}${result.thumbnailUrl ? `Thumbnail: ${result.thumbnailUrl}\n` : ''}\n`;
      }).join('');
    }

    // Add top stories if available
    if (searchResults.news?.length) {
      context += '### Top Stories\n';
      context += searchResults.news.map((story: NewsSearchResult, index: number) => {
        return `[${index + 1}] ${story.title}
Source: ${story.source}
Link: ${story.link}
${story.date ? `Date: ${story.date}\n` : ''}${story.imageUrl ? `Image: ${story.imageUrl}\n` : ''}${story.snippet ? `Summary: ${story.snippet}\n` : ''}\n`;
      }).join('');
    }

    // Add people also ask if available
    if (searchResults.peopleAlsoAsk?.length) {
      context += '### People Also Ask\n';
      context += searchResults.peopleAlsoAsk.map((item: { question: string; snippet: string; link: string; title?: string }, index: number) => {
        return `[${index + 1}] Q: ${item.question}
A: ${item.snippet}
Source: ${item.link}
${item.title ? `Title: ${item.title}\n` : ''}\n`;
      }).join('');
    }

    // Add related searches if available
    if (searchResults.relatedSearches?.length) {
      context += '### Related Searches\n';
      context += searchResults.relatedSearches.map((item: { query: string }, index: number) => 
        `[${index + 1}] ${item.query}\n`
      ).join('');
      context += '\n';
    }

    // Add images section if available
    if (searchResults.images?.length) {
      context += '### Images\n';
      context += searchResults.images.map((image: ImageSearchResult, index: number) => {
        return `[${index + 1}] ${image.title || 'Image'}
URL: ${image.imageUrl}
${image.source ? `Source: ${image.source}\n` : ''}\n`;
      }).join('');
    }

    // Add shopping results if available
    if (searchResults.shopping?.length) {
      context += '### Shopping Results\n';
      context += searchResults.shopping.map((item: ShoppingSearchResult, index: number) => {
        return `[${index + 1}] ${item.title}
Price: ${item.price || 'N/A'}
${item.rating ? `Rating: ${item.rating}\n` : ''}${item.source ? `Source: ${item.source}\n` : ''}${item.link ? `Link: ${item.link}\n` : ''}${item.imageUrl ? `Image: ${item.imageUrl}\n` : ''}\n`;
      }).join('');
    }

    // Add videos section if available
    if (searchResults.videos?.length) {
      context += '### Videos\n';
      context += searchResults.videos.map((video: VideoSearchResult, index: number) => {
        return `[${index + 1}] ${video.title}
Link: ${video.link}
${video.date ? `Date: ${video.date}\n` : ''}${video.duration ? `Duration: ${video.duration}\n` : ''}${video.imageUrl ? `Image: ${video.imageUrl}\n` : ''}\n`;
      }).join('');
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Include mode and refined query in context
    let searchContext = '';
    if (refinedQuery) {
      searchContext += `### Search Context\nOriginal Query: ${searchTerm}\nRefined Query: ${refinedQuery.query}\nRefinement Explanation: ${refinedQuery.explanation}\nSearch Mode: ${mode}\n\n`;
    } else {
      searchContext += `### Search Context\nQuery: ${searchTerm}\nSearch Mode: ${mode}\n\n`;
    }

    const prompt = rSearchPrompt(searchTerm, searchContext + context, currentDate);

    const model = process.env.NEXT_PUBLIC_AI_REASONING_MODEL;


    const response = await openai.chat.completions.create({
      model: model as string,  // Make sure to use the correct model name
      messages: [
        { role: "user", content: prompt },
        { role: 'user', content: searchTerm }
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
    console.error('OpenAI API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
