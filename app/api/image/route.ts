import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const input = {
      prompt,
      go_fast: true,
      guidance: 3.5,
      num_outputs: 4,
      aspect_ratio: aspectRatio || "1:1",
      output_format: "jpg",
      output_quality: 80,
      prompt_strength: 0.8,
      num_inference_steps: 28
    };

    const prediction = await replicate.predictions.create({
      version: "black-forest-labs/flux-dev",
      input
    });

    return NextResponse.json({ 
      success: true, 
      requestId: prediction.id 
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