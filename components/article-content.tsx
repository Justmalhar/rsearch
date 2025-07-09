'use client';

import { useState, Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from '@/hooks/use-media-query';
import Query from '@/components/rSearch/query';
import Thinking from '@/components/rSearch/thinking';
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Results from '@/components/rSearch/results';
import Sources from '@/components/rSearch/sources';
import { getWebsiteName } from '@/lib/utils';
import SourcesSidebar from '@/components/rSearch/sources-sidebar';

interface ArticleData {
  searchTerm: string;
  mode: string;
  refinedQuery?: string;
  refinedQueryExplanation?: string;
  sources?: SearchResult[];
  knowledgeGraph?: SerperResponse['knowledgeGraph'];
  reasoningContent?: string;
  aiResponse: string;
  rawSources?: {
    peopleAlsoAsk?: { question: string; snippet: string; link: string; }[];
    relatedSearches?: { query: string; }[];
  };
  metadata?: {
    isSourcesExpanded: boolean;
    isRefinedQueryExpanded: boolean;
    isThinkingExpanded: boolean;
    isResultsExpanded: boolean;
  };
}

interface ArticleContentProps {
  initialData: ArticleData;
}

export default function ArticleContent({ initialData }: ArticleContentProps) {
  // UI state from metadata or defaults
  const [isRefinedQueryExpanded, setIsRefinedQueryExpanded] = useState(
    initialData.metadata?.isRefinedQueryExpanded ?? true
  );
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(
    initialData.metadata?.isSourcesExpanded ?? true
  );
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(
    initialData.metadata?.isThinkingExpanded ?? true
  );
  const [isResultsExpanded, setIsResultsExpanded] = useState(
    initialData.metadata?.isResultsExpanded ?? true
  );
  const [showSourcesSidebar, setShowSourcesSidebar] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex min-h-screen">
      <div className={`flex-1 p-4 md:p-8 ${!isMobile ? 'pl-32' : ''} max-w-7xl mx-auto space-y-6 md:space-y-8`}>
        {/* 1. Query */}
        <Query searchTerm={initialData.searchTerm} mode={initialData.mode as SearchSource} />

        {/* 2. Query Refinement */}
        {initialData.refinedQuery && <section className="space-y-4">
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
          {!initialData.refinedQuery ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isRefinedQueryExpanded && initialData.refinedQuery && (
            <div className="space-y-2">
              <p className="text-orange-800">{initialData.refinedQuery}</p>
              <p className="text-sm text-orange-700 mt-2">{initialData.refinedQueryExplanation}</p>
            </div>
          )}
        </section>}

        {/* 3. Sources */}
        {initialData.sources && <section className="space-y-4">
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
          {!initialData.sources ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isSourcesExpanded && initialData.sources && (
            <Sources
              sources={initialData.sources}
              mode={initialData.mode as SearchSource}
              getWebsiteName={getWebsiteName}
              error={null}
              setShowSourcesSidebar={setShowSourcesSidebar}
              knowledgeGraph={initialData.knowledgeGraph}
            />
          )}
        </section>}

        {/* 4. Thinking */}
        {initialData.reasoningContent && <section>
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
          {isThinkingExpanded && <Thinking reasoningContent={initialData.reasoningContent} />}
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
              isAiLoading={false}
              aiResponse={initialData.aiResponse}
              aiError={null}
              isAiComplete={true}
              searchResults={initialData.rawSources || null}
              mode={initialData.mode as SearchSource}
              generateSearchId={() => ''}
              getWebsiteName={getWebsiteName}
              searchTerm={initialData.searchTerm}
            />
          )}
        </section>
      </div>
      {!isMobile && initialData.sources && (
        <SourcesSidebar 
          showSidebar={showSourcesSidebar}
          sources={initialData.sources}
          getWebsiteName={getWebsiteName}
        />
      )}
    </div>
  );
}

export function ArticleContentWrapper({ initialData }: ArticleContentProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5] p-4 md:p-8">Loading...</div>}>
      <ArticleContent initialData={initialData} />
    </Suspense>
  );
}
