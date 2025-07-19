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

// Helper function to safely get snippet or fallback for different result types
const getResultSnippet = (result: SearchResult): string => {
  if ('snippet' in result && result.snippet) {
    return result.snippet;
  }
  
  // For image results, use source info
  if ('source' in result && result.source) {
    return `Image from ${result.source}`;
  }
  
  // For place results, use address
  if ('address' in result && result.address) {
    return `Location: ${result.address}`;
  }
  
  // For shopping results, use price info
  if ('price' in result && result.price) {
    return `Price: ${result.price}`;
  }
  
  return 'No description available';
};

const deepResearchReportPrompt = (
  query: string, 
  researchPlan: ResearchStep[], 
  allResults: SearchResult[]
) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Create a comprehensive context from all search results
  const context = `# Deep Research Report Generation

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
   - ${getResultSnippet(result)}
`).join('')}
${step.results.length > 5 ? `... and ${step.results.length - 5} more results` : ''}
`).join('')}

## Total Sources Analyzed
${allResults.length} total search results across ${researchPlan.length} different search queries.

## Current Date
${currentDate}

Your task is to provide answers that are:
- **Informative and relevant**: Thoroughly address the user's query using the given context.
- **Well-structured**: Include clear headings and subheadings, and use a professional tone to present information concisely and logically.
- **Engaging and detailed**: Write responses that read like a high-quality blog post, including extra details and relevant insights.
- **Cited and credible**: Use inline citations with [Website Name](URL) notation to refer to the context source(s) for each fact or detail included.
- **Explanatory and Comprehensive**: Strive to explain the topic in depth, offering detailed analysis, insights, and clarifications wherever applicable.

### Formatting Instructions
- Always add a title to the response like a SEO Optimized blog post title.
- **Structure**: Use a well-organized format with proper headings (e.g., "## Example heading 1" or "## Example heading 2"). Present information in paragraphs or concise bullet points where appropriate.
- **Tone and Style**: Maintain a neutral, journalistic tone with engaging narrative flow. Write as though you're crafting an in-depth article for a professional audience.
- **Markdown Usage**: Format your response with Markdown for clarity. Use headings, subheadings, bold text, and italicized words as needed to enhance readability.
- **Length and Depth**: Provide comprehensive coverage of the topic. Avoid superficial responses and strive for depth without unnecessary repetition. Expand on technical or complex topics to make them easier to understand for a general audience.
- **No main heading/title**: Start your response directly with the introduction unless asked to provide a specific title.
- **Conclusion or Summary**: Include a concluding paragraph that synthesizes the provided information or suggests potential next steps, where appropriate.
- Link to the sources in the context using [Website Name](URL) notation. If the source is not a website, use the name of the source.
- If the source has images, include them in the response along with a caption and source to make it more engaging. 
  Example: ![Modi addressing a rally](https://d3i6fh83elv35t.cloudfront.net/static/2024/04/2024-04-14T041310Z_1493218909_RC2467AJ9W1C_RTRMADP_3_INDIA-ELECTION-MANIFESTO-1024x681.jpg)  
  *Modi campaigning for the 2024 elections (Source: [PBS](https://www.pbs.org/newshour/world/modi-vows-to-turn-india-into-global-manufacturing-hub-as-he-seeks-3rd-term-in-2024-election))*
- Double check if the image is a valid image. If not do not include it in the response.

### Markdown Formatting
Write in Github flavored markdown format using various sections such as tables, >, *italics*, **bold**, headings from # to ######, blockquotes, inline citation links, —- horizontal divider for the sections, only valid images from sources, language specific code in language specific markdown blocks. Try to maintain consistent structure section by section with hierarchy. 
Use bold for the most important information, italics for the keywords information, and normal text for the rest. Maximize the use of bold and italics to make the response more engaging and readable.

### In-line Citation Requirements
- Link to the sources in the context using [Website Name](URL) notation. If the source is not a website, use the name of the source.
- Cite every single fact, statement, or sentence using [Website Name](URL) notation corresponding to the source from the provided context.
- Integrate citations naturally at the end of sentences or clauses as appropriate.
- Ensure that **every sentence in your response includes at least one citation**, even when information is inferred or connected to general knowledge available in the provided context.
- Use multiple sources for a single detail if applicable.
- Always prioritize credibility and accuracy by linking all statements back to their respective context sources.
- Avoid citing unsupported assumptions or personal interpretations; if no source supports a statement, clearly indicate the limitation.
- Never cite the search query as a source.
- Never write it as [Apple.com](https://Apple.com). It should be [Apple](https://Apple.com). No need to mention the .com, .org, .net, etc. 

- Example In-Line Citations:
  - "According to [TechCrunch](https://techcrunch.com), OpenAI has made significant breakthroughs in language models"
  - "The latest MacBook Pro features impressive battery life, as detailed on [Apple Support](https://support.apple.com/macbook)"
  - "Prime members can expect faster delivery times in urban areas, according to [Amazon Prime](https://www.amazon.com/prime)"
  - "Developers can find the documentation on [GitHub Docs](https://docs.github.com)"
  - "The course is available for free on [MIT OpenCourseWare](https://ocw.mit.edu/courses)"
  - "Users reported the issue on [Stack Overflow](https://stackoverflow.com/questions)"

### Special Instructions
- If the query involves technical, historical, or complex topics, provide detailed background and explanatory sections to ensure clarity.
- If the user provides vague input or if relevant information is missing, explain what additional details might help refine the search.
- If no relevant information is found, say: "Hmm, sorry I could not find any relevant information on this topic. Would you like me to search again or ask something else?"


## Additional Instructions
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
      allResults
    }: { 
      query: string; 
      researchPlan: ResearchStep[];
      allResults: SearchResult[];
    } = await req.json();

    if (!query || !researchPlan || !allResults) {
      return new Response(
        JSON.stringify({ error: 'Query, research plan, and results are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = deepResearchReportPrompt(query, researchPlan, allResults);
    const model = "o4-mini";

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
