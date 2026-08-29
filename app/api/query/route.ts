import { refineSearchQuery } from '@/lib/refine-query';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { searchTerm, mode, contextTerm } = await req.json();
    const refined = await refineSearchQuery(searchTerm, mode, contextTerm);

    return new Response(JSON.stringify({
      refined_query: refined.query,
      explanation: refined.explanation,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search refinement error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to refine search query',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
