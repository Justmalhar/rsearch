'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import Query from '@/components/rSearch/query';
import Thinking from '@/components/rSearch/thinking';
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Results from '@/components/rSearch/results';
import Sources from '@/components/rSearch/sources';
import { getWebsiteName } from '@/lib/utils';
import SourcesSidebar from '@/components/rSearch/sources-sidebar';
import { useSearchParams } from 'next/navigation';
import FollowUpInput from '@/components/rSearch/follow-up-input';

interface FollowUpQuestion {
  id: string;
  question: string;
  timestamp: Date;
  isRefining: boolean;
  refinedQuery?: {
    query: string;
    explanation: string;
  } | null;
  isLoadingSources: boolean;
  sources: SearchResult[];
  knowledgeGraph?: SerperResponse['knowledgeGraph'];
  rawSources?: {
    peopleAlsoAsk?: { question: string; snippet: string; link: string; }[];
    relatedSearches?: { query: string; }[];
  };
  isAiLoading: boolean;
  aiResponse: string;
  reasoningContent: string;
  isAiComplete: boolean;
  aiError?: string;
  isRefinedQueryExpanded: boolean;
  isSourcesExpanded: boolean;
  isThinkingExpanded: boolean;
  isResultsExpanded: boolean;
}

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

  // Follow-up questions state
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useState(false);
  const followUpRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
        // Import Supabase client dynamically to avoid build-time evaluation
        const { supabase } = await import('@/lib/supabaseClient');
        
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

  // Function to scroll to a specific follow-up section
  const scrollToFollowUp = (questionId: string) => {
    const element = followUpRefs.current[questionId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Handle follow-up question submission
  const handleFollowUpQuestion = async (questionText: string) => {
    const newQuestion = {
      id: Date.now().toString(),
      question: questionText,
      timestamp: new Date(),
      isRefining: true,
      isLoadingSources: false,
      sources: [],
      isAiLoading: false,
      aiResponse: '',
      reasoningContent: '',
      isAiComplete: false,
      isRefinedQueryExpanded: true,
      isSourcesExpanded: true,
      isThinkingExpanded: true,
      isResultsExpanded: true
    };

    setFollowUpQuestions(prev => [...prev, newQuestion]);
    setIsProcessingFollowUp(true);

    // Scroll to the new question section after a short delay to ensure DOM is updated
    setTimeout(() => {
      scrollToFollowUp(newQuestion.id);
    }, 100);

    try {
      // Step 1: Refine Query
      const refinementRes = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchTerm: questionText, 
          mode,
          contextTerm: searchTerm
        })
      });

      let refinedQuery = null;
      if (refinementRes.ok) {
        const refinementData = await refinementRes.json();
        refinedQuery = {
          query: refinementData.refined_query,
          explanation: refinementData.explanation
        };
      }

      // Update with refined query
      setFollowUpQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { ...q, isRefining: false, refinedQuery, isLoadingSources: true }
            : q
        )
      );

      // Step 2: Search for sources
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          q: refinedQuery ? refinedQuery.query : questionText,
          mode 
        })
      });

      if (!searchRes.ok) throw new Error('Failed to fetch sources');
      
      const searchData = await searchRes.json();
      let newSources = [];
      
      // Handle different response formats
      if (mode === 'news') {
        newSources = Array.isArray(searchData) ? searchData : searchData.news || [];
      } else if (mode === 'web') {
        newSources = searchData.organic || [];
      } else if (mode === 'shopping') {
        newSources = Array.isArray(searchData) ? searchData : searchData.shopping || [];
      } else if (mode === 'scholar' || mode === 'patents') {
        if (Array.isArray(searchData)) {
          newSources = searchData;
        } else if (searchData.organic) {
          newSources = searchData.organic;
        }
      } else {
        newSources = searchData[mode] || [];
      }

      const newRawSources = {
        peopleAlsoAsk: searchData.peopleAlsoAsk,
        relatedSearches: searchData.relatedSearches
      };

      // Update with sources
      setFollowUpQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { 
                ...q, 
                isLoadingSources: false, 
                sources: newSources,
                knowledgeGraph: searchData.knowledgeGraph,
                rawSources: newRawSources,
                isAiLoading: true
              }
            : q
        )
      );

      // Step 3: Generate AI response using main rSearch endpoint
      // Combine original sources with new sources for comprehensive context
      const combinedSources = [...sources, ...newSources];
      const combinedSearchResults = {
        organic: combinedSources,
        knowledgeGraph: searchData.knowledgeGraph || knowledgeGraph
      };

      const aiRes = await fetch('/api/rsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchTerm: questionText,
          searchResults: combinedSearchResults,
          mode,
          refinedQuery
        }),
      });

      if (!aiRes.ok) throw new Error('Failed to generate AI response');
      if (!aiRes.body) throw new Error('No response body');

      const reader = aiRes.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let newReasoningContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const chunks = rawChunk.split('\n').filter(Boolean);
        
        for (const chunk of chunks) {
          try {
            const parsed = JSON.parse(chunk);
            if (parsed.reasoning_content) {
              newReasoningContent += parsed.reasoning_content;
            } else if (parsed.content) {
              aiContent += parsed.content;
            }
          } catch (err) {
            console.error('Error parsing chunk:', err);
          }
        }

                  // Update with streaming content
          setFollowUpQuestions(prev => 
            prev.map(q => 
              q.id === newQuestion.id 
                ? { 
                    ...q, 
                    aiResponse: aiContent,
                    reasoningContent: newReasoningContent
                  }
                : q
            )
          );
      }

              // Final update
        setFollowUpQuestions(prev => 
          prev.map(q => 
            q.id === newQuestion.id 
              ? { 
                  ...q, 
                  isAiLoading: false,
                  isAiComplete: true,
                  aiResponse: aiContent,
                  reasoningContent: newReasoningContent
                }
              : q
          )
        );

      // Scroll to the question again when content is fully loaded
      setTimeout(() => {
        scrollToFollowUp(newQuestion.id);
      }, 500);

    } catch (error) {
      setFollowUpQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { 
                ...q, 
                isRefining: false,
                isLoadingSources: false,
                isAiLoading: false,
                aiError: error instanceof Error ? error.message : 'An error occurred' 
              }
            : q
        )
      );
    } finally {
      setIsProcessingFollowUp(false);
    }
  };

  const toggleFollowUpSection = (questionId: string, section: 'query' | 'sources' | 'thinking' | 'results') => {
    setFollowUpQuestions(prev => 
      prev.map(q => {
        if (q.id !== questionId) return q;
        
        switch (section) {
          case 'query':
            return { ...q, isRefinedQueryExpanded: !q.isRefinedQueryExpanded };
          case 'sources':
            return { ...q, isSourcesExpanded: !q.isSourcesExpanded };
          case 'thinking':
            return { ...q, isThinkingExpanded: !q.isThinkingExpanded };
          case 'results':
            return { ...q, isResultsExpanded: !q.isResultsExpanded };
          default:
            return q;
        }
      })
    );
  };

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
              className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
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
              <p className="text-blue-800">{refinedQuery.query}</p>
              <p className="text-sm text-blue-700 mt-2">{refinedQuery.explanation}</p>
            </div>
            )}
          </section>
        )}

        {/* 3. Sources */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
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
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
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
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
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
              sources={sources}
            />
          )}
        </section>

        {/* Follow-up Questions Results - In main content area */}
        {followUpQuestions.map((question, index) => (
          <div 
            key={question.id} 
            ref={(el) => { followUpRefs.current[question.id] = el; }}
            className="border-t-2 border-blue-200 pt-8 md:pt-10 space-y-6 md:space-y-8 bg-gradient-to-r from-blue-50/30 to-transparent p-6 rounded-lg mt-6"
          >
            <div className="mb-4">
              <span className="text-sm text-blue-600">Follow-up #{index + 1}:</span>
              <h2 className="text-xl font-serif font-semibold text-blue-700 mt-1">{question.question}</h2>
            </div>

            {/* 1. Refined Query */}
            {question.refinedQuery && (
              <section className="space-y-4">
                <button
                  type="button"
                  onClick={() => toggleFollowUpSection(question.id, 'query')}
                  className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
                >
                  <span>Refined Query</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${question.isRefinedQueryExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {question.isRefining ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : question.isRefinedQueryExpanded && question.refinedQuery && (
                  <div className="space-y-2">
                    <p className="text-blue-800">{question.refinedQuery.query}</p>
                    <p className="text-sm text-blue-700 mt-2">{question.refinedQuery.explanation}</p>
                  </div>
                )}
              </section>
            )}

            {/* 2. Sources */}
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => toggleFollowUpSection(question.id, 'sources')}
                className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
              >
                <span>Sources</span>
                <svg
                  className={`w-5 h-5 transition-transform ${question.isSourcesExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {question.isLoadingSources ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : question.isSourcesExpanded && (
                <Sources
                  sources={question.sources}
                  mode={mode}
                  getWebsiteName={getWebsiteName}
                  error={question.aiError || null}
                  setShowSourcesSidebar={() => {}} // No sidebar for follow-up
                  knowledgeGraph={question.knowledgeGraph}
                />
              )}
            </section>

            {/* 3. Thinking */}
            {question.reasoningContent && (
              <section className="space-y-4">
                <button
                  type="button"
                  onClick={() => toggleFollowUpSection(question.id, 'thinking')}
                  className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
                >
                  <span>Thinking</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${question.isThinkingExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {question.isThinkingExpanded && <Thinking reasoningContent={question.reasoningContent} />}
              </section>
            )}

            {/* 4. Results */}
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => toggleFollowUpSection(question.id, 'results')}
                className="flex items-center gap-2 text-xl md:text-2xl font-medium text-blue-600"
              >
                <span>Results</span>
                <svg
                  className={`w-5 h-5 transition-transform ${question.isResultsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {question.isResultsExpanded && (
                <Results
                  isAiLoading={question.isAiLoading}
                  aiResponse={question.aiResponse}
                  aiError={question.aiError || null}
                  isAiComplete={question.isAiComplete}
                  searchResults={question.rawSources || null}
                  mode={mode}
                  generateSearchId={() => ''}
                  getWebsiteName={getWebsiteName}
                  searchTerm={question.question}
                  sources={question.sources}
                />
              )}
            </section>
          </div>
        ))}
      </div>
      {!isMobile && (
        <SourcesSidebar 
          showSidebar={showSourcesSidebar}
          sources={sources}
          getWebsiteName={getWebsiteName}
        />
      )}

      {/* Follow-up Input - Sticky to bottom */}
      <FollowUpInput
        isVisible={isAiComplete}
        originalSearchTerm={searchTerm}
        onSubmitQuestion={handleFollowUpQuestion}
        isProcessing={isProcessingFollowUp}
      />
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
