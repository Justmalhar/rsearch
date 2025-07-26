"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search, Globe, BookText, Video, Newspaper, GraduationCap } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Markdown from 'react-markdown';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Source {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
  date?: string;
}

interface KnowledgeGraph {
  title?: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  attributes?: Record<string, string>;
}

interface RawSources {
  peopleAlsoAsk?: Array<{
    question: string;
    snippet: string;
    link: string;
  }>;
  relatedSearches?: Array<{
    query: string;
  }>;
}

interface SearchResult {
  id: string;
  searchTerm: string;
  mode: string;
  createDate: string;
  aiResponse: string;
  refinedQuery?: string;
  refinedQueryExplanation?: string;
  sources?: Source[];
  knowledgeGraph?: KnowledgeGraph;
  reasoningContent?: string;
  rawSources?: RawSources;
  metadata?: Record<string, unknown>;
}

export default function LibraryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        // Import Supabase client dynamically to avoid build-time evaluation
        const { supabase } = await import('@/lib/supabaseClient');
        
        const { data, error } = await supabase
          .from('search_results')
          .select('*')
          .eq('publishArticle', true)
          .order('createDate', { ascending: false });

        if (error) throw error;

        setSearchResults(data || []);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, []);

  const handleCardClick = (item: SearchResult) => {
    const slug = `${item.searchTerm}-${item.mode}`.toLowerCase().replace(/\s+/g, '-');
    router.push(`/articles/${encodeURIComponent(slug)}`);
  };

  const getIconForMode = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'web':
        return <Globe className="h-4 w-4" />;
      case 'academic':
        return <GraduationCap className="h-4 w-4" />;
      case 'news':
        return <Newspaper className="h-4 w-4" />;
      case 'videos':
        return <Video className="h-4 w-4" />;
      case 'images':
        return <BookText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const trimTitle = (title: string, maxWords: number = 20) => {
    const words = title.split(' ');
    if (words.length <= maxWords) {
      return title;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Library</h1>
          <p className="text-blue-500/60 mt-2">Loading articles...</p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Library</h1>
          <p className="text-blue-500/60 mt-2">Error: {error}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">Library</h1>
          <p className="text-blue-500/60 text-lg">Curated collection of rSearch-powered insights</p>
        </header>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {searchResults.map((item) => (
              <Card 
                key={item.id}
                className="hover:shadow-lg transition-all duration-300 border-blue-200 hover:border-blue-400 cursor-pointer hover:-translate-y-1 bg-white"
                onClick={() => handleCardClick(item)}
              >
                <CardContent className="p-6">
                  <div className="text-2xl font-serif font-medium text-blue-700 mb-2 hover:text-blue-600 transition-colors leading-snug">
                    {trimTitle(item.searchTerm)}
                  </div>
                  <div className="text-base text-blue-600/90 prose prose-blue prose-sm mb-2 line-clamp-6 leading-relaxed">
                    <Markdown
                      components={{
                        h1: ({...props}) => (
                          <h1 {...props} className="text-2xl font-bold text-blue-600 mb-4" />
                        ),
                        h2: ({...props}) => (
                          <h2 {...props} className="text-xl font-bold text-blue-600 mt-4 mb-3" />
                        ),
                        h3: ({...props}) => (
                          <h3 {...props} className="text-lg font-bold text-blue-600 mt-4 mb-2" />
                        ),
                        h4: ({...props}) => (
                          <h4 {...props} className="text-base font-bold text-blue-600 mt-4 mb-2" />
                        ),
                        h5: ({...props}) => (
                          <h5 {...props} className="text-base font-bold text-blue-600 mt-4 mb-2" />
                        ),
                        h6: ({...props}) => (
                          <h6 {...props} className="text-base font-bold text-blue-600 mt-4 mb-2" />
                        ),
                      }}
                    >
                      {item.aiResponse ? `${item.aiResponse.slice(0, 500)}...` : 'No content available'}
                    </Markdown>
                  </div>
                  <div className="flex items-center justify-between mt-auto border-t border-blue-100 pt-4">
                    <div className="flex items-center gap-2 text-blue-500">
                      {getIconForMode(item.mode)}
                      <span className="text-sm font-medium">{item.mode}</span>
                    </div>
                    <time className="text-sm text-blue-500/80">
                      {new Date(item.createDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-serif font-medium text-blue-700 mb-2">
              No published articles
            </h2>
            <p className="text-blue-500/60 max-w-sm">
              Articles will appear here once they are published
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
