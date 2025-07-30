import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import OpenAI from 'openai';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize OpenRouter client for prompt enhancement
const openRouterClient = process.env.OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
}) : null;

// Model mapping from UI values to actual Replicate model versions
const MODEL_MAPPING = {
  fast: "black-forest-labs/flux-dev",
  pro: "black-forest-labs/flux-1.1-pro", 
  ultra: "black-forest-labs/flux-1.1-pro-ultra"
};

// Function to enhance prompt using LLM
async function enhancePrompt(inputPrompt: string): Promise<string> {
  try {
    if (!openRouterClient) {
      console.log('OpenRouter API key not configured, using original prompt');
      return inputPrompt;
    }
    
    const completion = await openRouterClient.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are PROMPTgineer, an expert AI visual prompt enhancer for text-to-image generation models such as Midjourney, DALL·E, and Stable Diffusion. Your job is to take a simple or short image description from the user and transform it into a rich, detailed, and highly visual prompt optimized for photorealistic or stylized AI image generation.

Instructions:
- Always enhance the prompt by adding relevant descriptors, such as camera angles, lighting, environment, color palette, style (e.g., cyberpunk, baroque, surreal), mood, realism level (photorealistic, digital art, anime), and composition framing.
- Expand nouns with descriptive adjectives.
- Replace vague terms with specific ones (e.g., "bird" → "majestic bald eagle soaring over pine forest").
- Keep the structure concise but expressive, aiming for maximum visual clarity.
- Output only the enhanced prompt, no preamble or commentary.
- Use commas to separate descriptors, and avoid using full sentences.

Example input: "A cat sitting on a windowsill"
Example output: "Cozy orange tabby cat lounging on sunlit windowsill, soft morning light, indoor urban apartment, warm color palette, shallow depth of field, photorealistic"

Begin enhancing user image prompts now.`
        },
        {
          role: "user",
          content: inputPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }, {
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rsearch.ai",
        "X-Title": "rSearch AI",
      }
    });

    return completion.choices[0].message.content || inputPrompt;
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    // Return original prompt if enhancement fails
    return inputPrompt;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio, model = 'fast' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Validate model selection
    if (!MODEL_MAPPING[model as keyof typeof MODEL_MAPPING]) {
      return NextResponse.json({ error: 'Invalid model selection' }, { status: 400 });
    }

    // Enhance the prompt using LLM
    const enhancedPrompt = await enhancePrompt(prompt);
    console.log('Original prompt:', prompt);
    console.log('Enhanced prompt:', enhancedPrompt);

    const input = {
      prompt: enhancedPrompt,
      go_fast: true,
      guidance: 3.5,
      num_outputs: 4,
      aspect_ratio: aspectRatio || "1:1",
      output_format: "jpg",
      output_quality: 100,
      prompt_strength: 0.8,
      num_inference_steps: 28
    };

    const prediction = await replicate.predictions.create({
      version: MODEL_MAPPING[model as keyof typeof MODEL_MAPPING],
      input
    });

    return NextResponse.json({ 
      success: true, 
      requestId: prediction.id,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const prediction = await replicate.predictions.get(requestId);

    return NextResponse.json({ 
      success: true, 
      status: prediction.status,
      output: prediction.output 
    });

  } catch (error) {
    console.error('Prediction status error:', error);
    return NextResponse.json(
      { error: 'Failed to get prediction status' }, 
      { status: 500 }
    );
  }
}