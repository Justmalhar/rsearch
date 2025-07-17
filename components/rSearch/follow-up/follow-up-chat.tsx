'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import FollowUpMessage from './follow-up-message';
import FollowUpResults from './follow-up-results';

export interface FollowUpQuestion {
  id: string;
  question: string;
  timestamp: Date;
  isLoading: boolean;
  error?: string;
  // Search results for this question
  sources?: SearchResult[];
  refinedQuery?: {
    query: string;
    explanation: string;
  } | null;
  reasoningContent?: string;
  aiResponse?: string;
  knowledgeGraph?: SerperResponse['knowledgeGraph'];
  rawSources?: {
    peopleAlsoAsk?: { question: string; snippet: string; link: string; }[];
    relatedSearches?: { query: string; }[];
  };
}

interface FollowUpChatProps {
  isVisible: boolean;
  onClose: () => void;
  originalSearchTerm: string;
  originalSources: SearchResult[];
  originalKnowledgeGraph?: SerperResponse['knowledgeGraph'];
  originalAiResponse: string;
  originalReasoningContent: string;
  mode: SearchSource;
  originalRefinedQuery?: {
    query: string;
    explanation: string;
  } | null;
}

export default function FollowUpChat({
  isVisible,
  onClose,
  originalSearchTerm,
  originalSources,
  originalAiResponse,
  originalReasoningContent,
  mode,
  originalRefinedQuery
}: FollowUpChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim()) return;

    const newQuestion: FollowUpQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.trim(),
      timestamp: new Date(),
      isLoading: true
    };

         setFollowUpQuestions(prev => [...prev, newQuestion]);
     const currentQuestionText = currentQuestion.trim();
     setCurrentQuestion('');

    try {
      // First, refine the query
      const refinementRes = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ 
           searchTerm: currentQuestionText, 
           mode,
           contextTerm: originalSearchTerm // Add original context
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

      // Then search for new sources
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
      
      // Handle different response formats like in the main page
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

      const rawSources = {
        peopleAlsoAsk: searchData.peopleAlsoAsk,
        relatedSearches: searchData.relatedSearches
      };

             // Generate AI response with both original and new context
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
          mode,
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

        // Update the question with streaming content
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

      // Final update with all data
      setFollowUpQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { 
                ...q, 
                isLoading: false,
                sources: newSources,
                refinedQuery,
                aiResponse: aiContent,
                reasoningContent: reasoningContent,
                knowledgeGraph: searchData.knowledgeGraph,
                rawSources
              }
            : q
        )
      );

    } catch (error) {
      setFollowUpQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { ...q, isLoading: false, error: error instanceof Error ? error.message : 'An error occurred' }
            : q
        )
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 right-0 z-50 ${isMobile ? 'left-0' : 'w-96'} max-h-[80vh] bg-white border-t border-l border-r border-orange-200 rounded-t-lg shadow-2xl`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-orange-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-600" />
          <h3 className="font-medium text-orange-800">Follow-up Questions</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 max-h-96">
            <div className="space-y-4">
              {followUpQuestions.length === 0 ? (
                <div className="text-center text-orange-600 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ask a follow-up question about &quot;{originalSearchTerm}&quot;</p>
                </div>
              ) : (
                followUpQuestions.map((question) => (
                  <div key={question.id} className="space-y-4">
                    <FollowUpMessage question={question} />
                    {!question.isLoading && !question.error && question.aiResponse && (
                      <FollowUpResults question={question} mode={mode} />
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-orange-100 bg-orange-50">
            <form onSubmit={handleSubmitQuestion} className="flex gap-2">
              <Input
                ref={inputRef}
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                disabled={followUpQuestions.some(q => q.isLoading)}
              />
              <Button
                type="submit"
                disabled={!currentQuestion.trim() || followUpQuestions.some(q => q.isLoading)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}