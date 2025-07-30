import { NextRequest, NextResponse } from 'next/server';

// Define the supported image generation models
const SUPPORTED_MODELS = {
  'flux-pro': {
    name: 'flux-pro',
    singleImage: true,
    description: 'High-quality single image generation'
  },
  'flux-ultra': {
    name: 'flux-ultra', 
    singleImage: true,
    description: 'Ultra-high quality single image generation'
  },
  'flux-standard': {
    name: 'flux-standard',
    singleImage: false,
    description: 'Standard quality image generation with multiple outputs support'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model, num_outputs } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model is required' },
        { status: 400 }
      );
    }

    // Validate model
    const modelConfig = SUPPORTED_MODELS[model as keyof typeof SUPPORTED_MODELS];
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unsupported model: ${model}` },
        { status: 400 }
      );
    }

    // Prepare the request payload for the image generation API
    const payload: any = {
      prompt,
      model: modelConfig.name
    };

    // Only include num_outputs for models that support multiple images
    if (!modelConfig.singleImage) {
      // Validate num_outputs for multi-image models
      if (num_outputs !== undefined) {
        if (typeof num_outputs !== 'number' || num_outputs < 1 || num_outputs > 4) {
          return NextResponse.json(
            { error: 'num_outputs must be a number between 1 and 4' },
            { status: 400 }
          );
        }
        payload.num_outputs = num_outputs;
      } else {
        // Default to 1 if not specified
        payload.num_outputs = 1;
      }
    } else {
      // For single image models (flux-pro, flux-ultra), ensure num_outputs is not included
      // This is the key fix - we don't pass num_outputs for single image models
      if (num_outputs !== undefined) {
        console.warn(`num_outputs parameter ignored for single image model: ${model}`);
      }
    }

    // Get API key and base URL from environment variables
    const apiKey = process.env.IMAGE_GENERATION_API_KEY;
    const baseUrl = process.env.IMAGE_GENERATION_BASE_URL;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Image generation API key not configured' },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Image generation base URL not configured' },
        { status: 500 }
      );
    }

    // Make the request to the image generation API
    const response = await fetch(`${baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Image generation API error:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Failed to generate image',
          details: errorData.error?.message || 'Unknown error from image generation service'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the response to match our expected format
    const images = data.data?.map((item: any, index: number) => ({
      url: item.url,
      alt: `${prompt} - Generated image ${index + 1}`
    })) || [];

    return NextResponse.json({
      images,
      model: modelConfig.name,
      prompt,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests to provide model information
export async function GET() {
  return NextResponse.json({
    models: Object.values(SUPPORTED_MODELS),
    supported_features: {
      single_image_models: ['flux-pro', 'flux-ultra'],
      multi_image_models: ['flux-standard']
    }
  });
}