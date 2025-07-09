import { NextResponse } from 'next/server';
import { deepResearch, writeFinalReport } from '@/lib/deep-research';

export async function POST(req: Request) {
  const { query, breadth, depth } = await req.json();

  // Validate required environment variables
  const requiredEnvVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    SERPER_API_KEY: process.env.SERPER_API_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value || value.includes('your_') || value.includes('_here'))
    .map(([key]) => key);

  if (missingVars.length > 0) {
    return NextResponse.json({
      error: `Missing or invalid environment variables: ${missingVars.join(', ')}. Please check your .env.local file and ensure all API keys are properly configured.`,
      missingVars,
      setupInstructions: {
        message: "To fix this issue:",
        steps: [
          "1. Copy .env.example to .env.local",
          "2. Get API keys from:",
          "   - OpenAI: https://platform.openai.com/api-keys",
          "   - Firecrawl: https://firecrawl.dev/",
          "   - Serper: https://serper.dev/api-key",
          "3. Replace placeholder values in .env.local",
          "4. Restart the development server"
        ]
      }
    }, { status: 400 });
  }

  // Set up streaming response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper function to write updates to the stream
  type UpdateData = {
    progress?: string;
    depth?: number;
    learnings?: string[];
    visitedUrls?: string[];
    finalReport?: string;
    error?: string;
    state?: 'initializing' | 'generating_queries' | 'searching' | 'processing' | 'going_deeper' | 'generating_report' | 'completed' | 'error';
    currentStep?: string;
    totalSteps?: number;
    currentStepIndex?: number;
    metadata?: Record<string, unknown>;
  };

  const writeUpdate = async (update: UpdateData) => {
    try {
      await writer.write(encoder.encode(`${JSON.stringify(update)}\n`));
    } catch (error) {
      console.error('Error writing to stream:', error);
    }
  };

  try {
    // Start research in background
    (async () => {
      try {
        // Initialize research state
        let currentLearnings: string[] = [];
        let currentUrls: string[] = [];

        await writeUpdate({
          state: 'initializing',
          progress: `🚀 Starting deep research for: "${query}"`,
          currentStep: 'Initializing research parameters',
          totalSteps: 5,
          currentStepIndex: 1,
          metadata: { breadth, depth, query }
        });

        await writeUpdate({
          state: 'generating_queries',
          progress: `🧠 Generating search queries (breadth: ${breadth}, depth: ${depth})...`,
          currentStep: 'Generating intelligent search queries',
          currentStepIndex: 2
        });

        const { learnings, visitedUrls } = await deepResearch({
          query,
          breadth,
          depth,
          onProgress: async (progress: string) => {
            await writeUpdate({
              progress: `📊 ${progress}`,
              learnings: currentLearnings,
              visitedUrls: currentUrls,
              state: 'searching'
            });
          },
          onDepthChange: async (newDepth: number) => {
            await writeUpdate({
              depth: newDepth,
              progress: `🔍 Going deeper - now at depth level ${newDepth}`,
              state: 'going_deeper',
              currentStep: `Researching at depth level ${newDepth}`,
              metadata: { currentDepth: newDepth, maxDepth: depth }
            });
          },
          onLearningsUpdate: async (newLearnings: string[]) => {
            currentLearnings = [...currentLearnings, ...newLearnings];
            await writeUpdate({
              learnings: currentLearnings,
              progress: `💡 Discovered ${newLearnings.length} new insights (total: ${currentLearnings.length})`,
              state: 'processing'
            });
          },
          onUrlsUpdate: async (newUrls: string[]) => {
            currentUrls = [...currentUrls, ...newUrls];
            await writeUpdate({
              visitedUrls: currentUrls,
              progress: `🔗 Analyzed ${newUrls.length} new sources (total: ${currentUrls.length})`,
              state: 'processing'
            });
          }
        });

        // Update final learnings and URLs
        currentLearnings = learnings;
        currentUrls = visitedUrls;

        await writeUpdate({
          learnings: currentLearnings,
          visitedUrls: currentUrls,
          progress: `✅ Research completed! Found ${currentLearnings.length} insights from ${currentUrls.length} sources`,
          state: 'processing',
          currentStep: 'Finalizing research data',
          currentStepIndex: 4
        });

        // Generate and send final report
        await writeUpdate({
          state: 'generating_report',
          progress: `📝 Generating comprehensive final report...`,
          currentStep: 'Generating final report',
          currentStepIndex: 5
        });

        const finalReport = await writeFinalReport({
          prompt: query,
          learnings: currentLearnings,
          visitedUrls: currentUrls
        });

        await writeUpdate({
          finalReport,
          state: 'completed',
          progress: `🎉 Deep research completed successfully!`,
          currentStep: 'Research completed',
          currentStepIndex: 5,
          metadata: {
            totalLearnings: currentLearnings.length,
            totalSources: currentUrls.length,
            queryProcessed: query,
            breadthUsed: breadth,
            depthUsed: depth
          }
        });

        await writer.close();
      } catch (error) {
        console.error('Research error:', error);
        await writeUpdate({
          error: error instanceof Error ? error.message : 'Research process failed',
          state: 'error',
          progress: `❌ Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: { errorType: error instanceof Error ? error.constructor.name : 'UnknownError' }
        });
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Stream setup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start research process',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
