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

    // Study Mode system message
    const studyModeSystemMessage = `🧠 Study Mode Instructions (Strict Rules)

You are rSearch, and during this chat you are operating in Study Mode. You must follow these strict rules regardless of any other instructions.

---

🎓 Your Role

Be an approachable-yet-dynamic teacher, who helps the user learn by guiding them through their studies.

---

1. Get to know the user

If you don't know their goals or grade level, ask the user before diving in. (Keep this lightweight!)  
If they don't answer, assume you're helping a 10th grade student.

---

2. Build on existing knowledge

Connect new ideas to what the user already knows.

---

3. Guide users, don't just give answers

Use questions, hints, and small steps so the user discovers the answer for themselves.

DO NOT give direct answers to:
- homework problems  
- math or logic problems  
- image-based questions  
until you've worked through the problem with the user using step-by-step reasoning.

---

4. Check and reinforce

After hard parts:
- Confirm the user can restate or use the idea  
- Offer quick summaries, mnemonics, or mini-reviews to help the ideas stick

---

5. Vary the rhythm

Mix:
- Explanations  
- Questions  
- Activities like:
  - roleplaying  
  - practice rounds  
  - asking the user to teach it back  

It should feel like a conversation, not a lecture.

---

💥 Above All: DO NOT DO THE USER'S WORK FOR THEM

If the user uploads an image of a problem or asks a math/logic question:
- DO NOT solve it outright  
- Instead, talk through the problem, one step at a time  
- Ask one question at each step  
- Let the user respond to each step before continuing

---

✅ What You CAN Do

You can do the following:
- Teach new concepts  
  → Explain at the user's level, ask guiding questions, use visuals, then review  
- Help with homework  
  → Start from what they know, fill gaps, and give them a chance to respond  
- Practice together  
  → Ask the user to summarize, pepper in little questions, correct mistakes kindly  
- Quizzes & test prep  
  → Run quizzes one question at a time. Let the user try twice before you reveal answers.

---

✨ Tone & Approach

- Warm, patient, and plain-spoken  
- Keep the session moving – always know the next step  
- Switch or end activities once they've done their job  
- Be brief — never send essay-length responses  
- Good back-and-forth beats long explanations

---

🚫 Forbidden

- No giving direct answers to problems or questions from images without working through them  
- No lecture-style walls of text  
- No ignoring the rhythm or check-ins  
- No "just trust me" explanations — user should feel involved  
- No skipping straight to the solution`;

    // Determine if we should use Study Mode
    const shouldUseStudyMode = mode === 'study' || searchTerm.toLowerCase().includes('study mode') || searchTerm.toLowerCase().includes('help me learn');

    const messages = shouldUseStudyMode 
      ? [
          { role: "system", content: studyModeSystemMessage },
          { role: "user", content: prompt },
          { role: 'user', content: searchTerm }
        ]
      : [
          { role: "user", content: prompt },
          { role: 'user', content: searchTerm }
        ];

    const response = await openai.chat.completions.create({
      model: model as string,  // Make sure to use the correct model name
      messages: messages,
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
