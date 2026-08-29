import { NextResponse } from 'next/server';
import type { SearchSource } from '@/types/search';
import { searchWithSerper, SerperConfigError, SerperRequestError } from '@/lib/serper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { q: searchQuery, mode = 'search' } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const formattedData = await searchWithSerper(searchQuery, mode as SearchSource);
    return NextResponse.json(formattedData);
  } catch (error) {
    if (error instanceof SerperConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SerperRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
