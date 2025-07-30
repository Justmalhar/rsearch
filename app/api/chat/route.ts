import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

// Extended type for completion request with OpenRouter headers
type CompletionRequest = OpenAI.Chat.Completions.ChatCompletionCreateParams & {
  extra_headers?: {
    "HTTP-Referer": string;
    "X-Title": string;
  };
};

// Helper function to determine if a model is from OpenRouter
function isOpenRouterModel(model: string): boolean {
  return model.includes('/') && !model.startsWith('gpt-') && !model.startsWith('deepseek-');
}

// Helper function to get the appropriate client configuration
function getClientConfig(model: string) {
  const isOpenRouter = isOpenRouterModel(model);
  
  if (isOpenRouter) {
    // Use OpenRouter configuration
    return {
      apiKey: process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY || '',
      baseURL: 'https://openrouter.ai/api/v1',
    };
  } else {
    // Use OpenAI configuration
    return {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseURL: 'https://api.openai.com',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'gpt-4.1' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const isOpenRouter = isOpenRouterModel(model);
    
    // Check if appropriate API key is configured
    if (isOpenRouter && !process.env.NEXT_PUBLIC_AI_PROVIDER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      );
    }
    
    if (!isOpenRouter && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const clientConfig = getClientConfig(model);
    const client = new OpenAI(clientConfig);

    const currentDate = new Date().toISOString();

    // Create the system message with improved prompt based on rSearch
    const systemMessage = {
      role: 'system' as const,
      content: `You are rSearch Chat, an AI assistant developed by rSearch to help users with their queries in a chat interface. You excel at providing detailed, engaging, and well-structured answers.

Your responses should be:
- **Informative and relevant**: Thoroughly address the user's query with comprehensive information
- **Well-structured**: Use clear headings, subheadings, and professional tone
- **Engaging and detailed**: Write responses that are conversational yet informative
- **Explanatory and Comprehensive**: Provide detailed analysis and insights
- **Markdown Formatted**: Use proper markdown formatting for better readability

### Formatting Instructions
- Use markdown formatting with headings, bold text, italicized words, and bullet points
- Structure your responses with clear sections using headings (## Example heading)
- Use **bold** for important information and *italics* for keywords
- Include code blocks when relevant with proper syntax highlighting
- Use blockquotes for important notes or quotes
- Keep responses conversational but professional

### Response Guidelines
- Be helpful, accurate, and engaging
- Provide detailed explanations when appropriate
- Use examples to illustrate concepts
- Ask clarifying questions if the user's request is unclear
- Maintain a friendly and professional tone

Today's date is: ${currentDate}

Remember to be conversational and helpful while maintaining the quality and structure that rSearch is known for.`
    };

    // Add the system message to the beginning of the messages array
    const messagesWithSystem = [systemMessage, ...messages];

    // Prepare the completion request
    const completionRequest: CompletionRequest = {
      model: model,
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    };

    // Add OpenRouter specific headers if using OpenRouter
    if (isOpenRouter) {
      completionRequest.extra_headers = {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rsearch.ai",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "rSearch",
      };
    }

    const stream = await client.chat.completions.create(completionRequest);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}