import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

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

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}