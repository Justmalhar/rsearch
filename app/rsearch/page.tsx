'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from "@/components/ui/skeleton";
import Query from '@/components/rSearch/query';
import Thinking from '@/components/rSearch/thinking';
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Results from '@/components/rSearch/results';
import Sources from '@/components/rSearch/sources';
import { getWebsiteName } from '@/lib/utils';
import SourcesSidebar from '@/components/rSearch/sources-sidebar';
import { useSearchParams } from 'next/navigation';

function SearchPageContent() {
  // 1. Search params
  const params = useSearchParams();
  const searchTerm = params.get('q') || '';
  const mode = (params.get('mode') || '') as SearchSource;
  const shouldRefine = params.get('refine') !== 'false'; // Default to true if not specified

  // 2. Query refinement state
  const [isRefining, setIsRefining] = useState(true);
  const [refinedQuery, setRefinedQuery] = useState<{
    query: string;
    explanation: string;
  } | null>(null);

  // AI Response state
  const [aiResponse, setAiResponse] = useState<string>('');
  const [reasoningContent, setReasoningContent] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiComplete, setIsAiComplete] = useState(false);

  // 3. Sources state
  const [isRefinedQueryExpanded, setIsRefinedQueryExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);

  // Load saved settings on client side
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const autoExpand = settings.autoExpandSections ?? true;
      setIsRefinedQueryExpanded(autoExpand);
      setIsSourcesExpanded(autoExpand);
      setIsThinkingExpanded(autoExpand);
    }
  }, []);
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSourcesSidebar, setShowSourcesSidebar] = useState(false);
  const [knowledgeGraph, setKnowledgeGraph] = useState<SerperResponse['knowledgeGraph']>();
  const [rawSources, setRawSources] = useState<{
    peopleAlsoAsk?: { question: string; snippet: string; link: string; }[];
    relatedSearches?: { query: string; }[];
  } | null>(null);
  useEffect(() => {
    let isMounted = true;

    const fetchRefinedQuery = async () => {
      if (!searchTerm) return;

      try {
        // Step 2: Refine Query (if enabled)
        if (shouldRefine) {
          setIsRefining(true);
          const refinementRes = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchTerm, mode })
          });

          if (!refinementRes.ok) throw new Error('Failed to refine query');
          
          const refinementData = await refinementRes.json();
          if (isMounted) {
            setRefinedQuery({
              query: refinementData.refined_query,
              explanation: refinementData.explanation
            });
            setIsRefining(false);
          }
        } else {
          setIsRefining(false);
          setRefinedQuery(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setIsRefining(false);
        }
      }
    };

    fetchRefinedQuery();
    return () => { isMounted = false };
  }, [searchTerm, mode, shouldRefine]);

  // Separate effect for fetching search results
  useEffect(() => {
    let isMounted = true;

    const fetchSearchResults = async () => {
      if (!searchTerm) return;

      try {
        setIsLoadingSources(true);
        const searchRes = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({ 
            q: shouldRefine && refinedQuery ? refinedQuery.query : searchTerm,
            mode 
          })
        });

        if (!searchRes.ok) throw new Error('Failed to fetch sources');
        
        const searchData: SerperResponse = await searchRes.json();
        const formattedSources = {
          peopleAlsoAsk: searchData.peopleAlsoAsk,
          relatedSearches: searchData.relatedSearches
        };
        setRawSources(formattedSources);
        if (isMounted) {
          // Handle different response formats
          if (mode === 'news') {
            const newsItems = Array.isArray(searchData) ? searchData : searchData.news || [];
            setSources(newsItems);
          } else if (mode === 'web') {
            // For web mode, use organic results
            setSources(searchData.organic || []);
            setKnowledgeGraph(searchData.knowledgeGraph);
          } else if (mode === 'shopping') {
            // For shopping mode, use shopping results
            const shoppingItems = Array.isArray(searchData) ? searchData : searchData.shopping || [];
            setSources(shoppingItems);
          } else if (mode === 'scholar' || mode === 'patents') {
            // For scholar/patents mode, use organic results
            if (Array.isArray(searchData)) {
              setSources(searchData);
            } else if (searchData.organic) {
              setSources(searchData.organic);
            } else {
              setSources([]);
            }
          } else {
            setSources(searchData[mode] || []);
          }
          setIsLoadingSources(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setIsLoadingSources(false);
        }
      }
    };

    // Only fetch search results when we have the refined query (if refinement is enabled)
    // or immediately if refinement is disabled
    if (!shouldRefine || refinedQuery !== null) {
      fetchSearchResults();
    }

    return () => { isMounted = false };
  }, [searchTerm, mode, shouldRefine, refinedQuery]);

  // Separate effect for AI response
  useEffect(() => {
    let isMounted = true;

    const fetchAiResponse = async () => {
      if (!sources.length || !searchTerm) return;

      try {
        setIsAiLoading(true);
        setIsAiComplete(false);
        setAiError(null);
        setAiResponse('');
        setReasoningContent('');

            const aiResponse = await fetch('/api/rsearch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                searchTerm,
                searchResults: {
                  organic: sources,
                  knowledgeGraph
                },
                mode,
                refinedQuery: refinedQuery ? {
                  query: refinedQuery.query,
                  explanation: refinedQuery.explanation
                } : undefined
              }),
            });

            if (!aiResponse.ok) throw new Error('Failed to generate AI response');
            if (!aiResponse.body) throw new Error('No response body');

            const reader = aiResponse.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                if (isMounted) {
                  setIsAiLoading(false);
                  setIsAiComplete(true);
                }
                break;
              }

              const rawChunk = decoder.decode(value, { stream: true });
              // Each chunk is a JSON string followed by newline
              const chunks = rawChunk.split('\n').filter(Boolean);
              
              if (isMounted) {
                for (const chunk of chunks) {
                  try {
                    const parsed = JSON.parse(chunk);
                    if (parsed.reasoning_content) {
                      setReasoningContent(prev => prev + parsed.reasoning_content);
                    } else if (parsed.content) {
                      setAiResponse(prev => prev + parsed.content);
                    }
                  } catch (err) {
                    console.error('Error parsing chunk:', err);
                  }
                }
              }
            }
      } catch (err) {
        console.error('AI Error:', err);
        if (isMounted) {
          setAiError(err instanceof Error ? err.message : 'An error occurred generating AI response');
          setIsAiLoading(false);
          setIsAiComplete(false);
        }
      }
    };

    fetchAiResponse();
    return () => { isMounted = false };
  }, [sources, searchTerm, mode, knowledgeGraph, refinedQuery]);

  // Save search results to Supabase when AI response is complete
  useEffect(() => {
    const saveSearchResults = async () => {
      if (!isAiComplete || !searchTerm || !aiResponse) return;

      try {
        const { error } = await supabase
          .from('search_results')
          .insert({
            searchTerm,
            mode,
            refinedQuery: refinedQuery?.query || null,
            refinedQueryExplanation: refinedQuery?.explanation || null,
            sources: sources,
            knowledgeGraph: knowledgeGraph || null,
            reasoningContent,
            aiResponse,
            rawSources: rawSources || null,
            metadata: {
              isSourcesExpanded,
              isRefinedQueryExpanded,
              isThinkingExpanded,
              isResultsExpanded
            },
            publishArticle: true
          });

        if (error) {
          console.error('Error saving search results:', error);
        }
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      }
    };

    saveSearchResults();
  }, [isAiComplete, searchTerm, mode, refinedQuery, sources, knowledgeGraph, reasoningContent, aiResponse, rawSources, isSourcesExpanded, isRefinedQueryExpanded, isThinkingExpanded, isResultsExpanded]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 p-4 md:p-8 ${!isMobile ? 'pl-32' : ''} max-w-7xl mx-auto space-y-6 md:space-y-8`}>
        {/* 1. Query */}
        <Query searchTerm={searchTerm} mode={mode} />

        {/* 2. Query Refinement */}
        {shouldRefine && (
          <section className="space-y-4">
            <button
              type="button"
              onClick={() => setIsRefinedQueryExpanded(!isRefinedQueryExpanded)}
              className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Refined Query</span>
            <svg
              className={`w-5 h-5 transition-transform ${isRefinedQueryExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="refined-query-title"
              role="img"
            >
              <title id="refined-query-title">Toggle Refined Query</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isRefining ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : refinedQuery && isRefinedQueryExpanded && (
            <div className="space-y-2">
              <p className="text-orange-800">{refinedQuery.query}</p>
              <p className="text-sm text-orange-700 mt-2">{refinedQuery.explanation}</p>
            </div>
            )}
          </section>
        )}

        {/* 3. Sources */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Sources</span>
            <svg
              className={`w-5 h-5 transition-transform ${isSourcesExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="sources-title"
              role="img"
            >
              <title id="sources-title">Toggle Sources</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isLoadingSources ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isSourcesExpanded && (
            <Sources
              sources={sources}
              mode={mode}
              getWebsiteName={getWebsiteName}
              error={error}
              setShowSourcesSidebar={setShowSourcesSidebar}
              knowledgeGraph={knowledgeGraph}
            />
          )}
        </section>

        {/* 4. Thinking */}
        {reasoningContent && <section>
          <button
            type="button"
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Thinking</span>
            <svg
              className={`w-5 h-5 transition-transform ${isThinkingExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="thinking-title"
              role="img"
            >
              <title id="thinking-title">Toggle Thinking</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isThinkingExpanded && <Thinking reasoningContent={reasoningContent} />}
        </section>}

        {/* 5. Results */}
        <section>
          <button
            type="button"
            onClick={() => setIsResultsExpanded(!isResultsExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Results</span>
            <svg
              className={`w-5 h-5 transition-transform ${isResultsExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-labelledby="results-title"
              role="img"
            >
              <title id="results-title">Toggle Results</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isResultsExpanded && (
            <Results
              isAiLoading={isAiLoading}
              aiResponse={aiResponse}
              aiError={aiError}
              isAiComplete={isAiComplete}
              searchResults={rawSources}
              mode={mode}
              generateSearchId={() => ''}
              getWebsiteName={getWebsiteName}
              searchTerm={searchTerm}
            />
          )}
        </section>
      </div>
      {!isMobile && (
        <SourcesSidebar 
          showSidebar={showSourcesSidebar}
          sources={sources}
          getWebsiteName={getWebsiteName}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5] p-4 md:p-8">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
