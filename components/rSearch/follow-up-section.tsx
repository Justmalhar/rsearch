'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCirclePlus, X } from 'lucide-react';
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Sources from './sources';
import Thinking from './thinking';
import Results from './results';
import { getWebsiteName } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface FollowUpQuestion {
  id: string;
  question: string;
  timestamp: Date;
  // Query refinement state
  isRefining: boolean;
  refinedQuery?: {
    query: string;
    explanation: string;
  } | null;
  // Sources state
  isLoadingSources: boolean;
  sources: SearchResult[];
  knowledgeGraph?: SerperResponse['knowledgeGraph'];
  rawSources?: {
    peopleAlsoAsk?: { question: string; snippet: string; link: string; }[];
    relatedSearches?: { query: string; }[];
  };
  // AI Response state
  isAiLoading: boolean;
  aiResponse: string;
  reasoningContent: string;
  isAiComplete: boolean;
  aiError?: string;
  // UI state
  isRefinedQueryExpanded: boolean;
  isSourcesExpanded: boolean;
  isThinkingExpanded: boolean;
  isResultsExpanded: boolean;
}

interface FollowUpSectionProps {
  isVisible: boolean;
  originalSearchTerm: string;
  originalSources: SearchResult[];
  originalAiResponse: string;
  originalReasoningContent: string;
  mode: SearchSource;
  originalRefinedQuery?: {
    query: string;
    explanation: string;
  } | null;
}

export default function FollowUpSection({
  isVisible,
  originalSearchTerm,
  originalSources,
  originalAiResponse,
  originalReasoningContent,
  mode,
  originalRefinedQuery
}: FollowUpSectionProps) {
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim()) return;

    const newQuestion: FollowUpQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.trim(),
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
    const currentQuestionText = currentQuestion.trim();
    setCurrentQuestion('');
    setShowQuestionInput(false); // Hide the input form
    setIsProcessing(true);

    try {
      // Step 1: Refine Query
      const refinementRes = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchTerm: currentQuestionText, 
          mode,
          contextTerm: originalSearchTerm
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
          q: refinedQuery ? refinedQuery.query : currentQuestionText,
          mode 
        })
      });

      if (!searchRes.ok) throw new Error('Failed to fetch sources');
      
      const searchData: SerperResponse = await searchRes.json();
      let newSources: SearchResult[] = [];
      
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

      // Step 3: Generate AI response
      const aiRes = await fetch('/api/rsearch/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          followUpQuestion: currentQuestionText,
          originalSearchTerm,
          originalSources,
          originalAiResponse,
          originalReasoningContent,
          newSources,
          knowledgeGraph: searchData.knowledgeGraph,
          refinedQuery,
          originalRefinedQuery
        }),
      });

      if (!aiRes.ok) throw new Error('Failed to generate AI response');
      if (!aiRes.body) throw new Error('No response body');

      const reader = aiRes.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let reasoningContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const chunks = rawChunk.split('\n').filter(Boolean);
        
        for (const chunk of chunks) {
          try {
            const parsed = JSON.parse(chunk);
            if (parsed.reasoning_content) {
              reasoningContent += parsed.reasoning_content;
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
                  reasoningContent: reasoningContent
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
                reasoningContent: reasoningContent
              }
            : q
        )
      );

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
      setIsProcessing(false);
    }
  };

  const toggleSection = (questionId: string, section: 'query' | 'sources' | 'thinking' | 'results') => {
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

  if (!isVisible) return null;

  return (
    <>
      {/* Follow-up Questions Results - In main content area */}
      {followUpQuestions.map((question, index) => (
        <div key={question.id} className={`${isMobile ? '' : 'pl-32'} max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-8 border-t border-orange-100`}>
          <div className="text-sm text-orange-600 mb-4">
            Follow-up #{index + 1}: {question.question}
          </div>

          {/* 1. Refined Query */}
          {question.refinedQuery && (
            <section className="space-y-4">
              <button
                type="button"
                onClick={() => toggleSection(question.id, 'query')}
                className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
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
                  <p className="text-orange-800">{question.refinedQuery.query}</p>
                  <p className="text-sm text-orange-700 mt-2">{question.refinedQuery.explanation}</p>
                </div>
              )}
            </section>
          )}

          {/* 2. Sources */}
          <section className="space-y-4">
            <button
              type="button"
              onClick={() => toggleSection(question.id, 'sources')}
              className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
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
                onClick={() => toggleSection(question.id, 'thinking')}
                className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
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
              onClick={() => toggleSection(question.id, 'results')}
              className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
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

      {/* Sticky Bottom Input - Only show if no processing and no input shown */}
      {!isProcessing && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 ${isMobile ? '' : 'pl-32'}`}>
          {!showQuestionInput ? (
            // Show follow-up button
            <div className="bg-white/95 backdrop-blur-sm border-t border-orange-200 p-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCirclePlus className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-600 font-medium">Ask a follow-up question</span>
                  </div>
                  <Button
                    onClick={() => setShowQuestionInput(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Ask Question
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Show input form
            <div className="bg-white border-t border-orange-200 p-4 shadow-2xl">
              <div className="max-w-7xl mx-auto">
                <form onSubmit={handleSubmitQuestion} className="flex gap-2">
                  <Input
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder={`Ask a follow-up question about "${originalSearchTerm}"...`}
                    className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!currentQuestion.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuestionInput(false);
                      setCurrentQuestion('');
                    }}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom padding to prevent content from being hidden behind sticky input */}
      <div className={`h-20 ${followUpQuestions.length > 0 ? 'block' : 'hidden'}`}></div>
    </>
  );
}