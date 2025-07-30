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

// Model-specific configurations
const MODEL_CONFIGS = {
  fast: {
    num_outputs: 4,
    num_inference_steps: 28,
    guidance: 3.5,
    prompt_strength: 0.8
  },
  pro: {
    num_outputs: 4,
    num_inference_steps: 28,
    guidance: 3.5,
    prompt_strength: 0.8
  },
  ultra: {
    num_outputs: 4,
    num_inference_steps: 28,
    guidance: 3.5,
    prompt_strength: 0.8
  }
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
    console.log('Selected model:', model);
    console.log('Model version:', MODEL_MAPPING[model as keyof typeof MODEL_MAPPING]);

    // Get model-specific configuration
    const modelConfig = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS];
    console.log('Model config:', modelConfig);

    const input = {
      prompt: enhancedPrompt,
      go_fast: true,
      guidance: modelConfig.guidance,
      num_outputs: modelConfig.num_outputs,
      aspect_ratio: aspectRatio || "1:1",
      output_format: "jpg",
      output_quality: 100,
      prompt_strength: modelConfig.prompt_strength,
      num_inference_steps: modelConfig.num_inference_steps
    };

    console.log('Replicate input parameters:', JSON.stringify(input, null, 2));

    // For Pro and Ultra models, we might need to handle potential resource constraints
    let prediction;
    try {
      prediction = await replicate.predictions.create({
        version: MODEL_MAPPING[model as keyof typeof MODEL_MAPPING],
        input
      });
    } catch (error: any) {
      console.error(`Error creating prediction for model ${model}:`, error);
      
      // If it's a resource constraint error, try with reduced parameters
      if (error.message?.includes('resource') || error.message?.includes('capacity') || error.message?.includes('queue')) {
        console.log('Attempting with reduced parameters due to resource constraints...');
        
        const reducedInput = {
          ...input,
          num_outputs: 2, // Reduce to 2 outputs
          num_inference_steps: Math.floor(modelConfig.num_inference_steps * 0.8) // Reduce steps by 20%
        };
        
        prediction = await replicate.predictions.create({
          version: MODEL_MAPPING[model as keyof typeof MODEL_MAPPING],
          input: reducedInput
        });
        
        console.log('Successfully created prediction with reduced parameters');
      } else {
        throw error; // Re-throw if it's not a resource issue
      }
    }

    console.log('Prediction created with ID:', prediction.id);
    console.log('Prediction status:', prediction.status);

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

    console.log('Prediction status check for ID:', requestId);
    console.log('Prediction status:', prediction.status);
    console.log('Prediction output length:', prediction.output ? prediction.output.length : 0);
    if (prediction.output) {
      console.log('Output URLs:', prediction.output);
    }

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