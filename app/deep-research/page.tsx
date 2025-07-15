'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Results from '@/components/rSearch/results';
import { getWebsiteName } from '@/lib/utils';
import { Brain, Search, Sparkles } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface DeepResearchStep {
  id: string;
  query: string;
  mode: SearchSource;
  results: SearchResult[];
  status: 'pending' | 'active' | 'completed' | 'error';
}

function DeepResearchContent() {
  const params = useSearchParams();
  const query = params.get('query') || '';
  const mode = (params.get('mode') || 'web') as SearchSource;

  // State for the research process
  const [researchPlan, setResearchPlan] = useState<DeepResearchStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(true);
  const [isExecutingSearches, setIsExecutingSearches] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // UI state
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const autoExpand = settings.autoExpandSections ?? true;
      setIsSourcesExpanded(autoExpand);
      setIsResultsExpanded(autoExpand);
    }
  }, []);

  // Generate research plan
  useEffect(() => {
    if (!query) return;

    const generateResearchPlan = async () => {
      try {
        setIsGeneratingPlan(true);
        const response = await fetch('/api/deep-research/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, mode })
        });

        if (!response.ok) throw new Error('Failed to generate research plan');
        
        const plan = await response.json();
        setResearchPlan(plan.steps.map((step: DeepResearchStep) => ({
          ...step,
          results: [],
          status: 'pending' as const
        })));
        setIsGeneratingPlan(false);
      } catch (error) {
        console.error('Error generating research plan:', error);
        setIsGeneratingPlan(false);
      }
    };

    generateResearchPlan();
  }, [query, mode]);

  // Execute searches step by step
  useEffect(() => {
    if (researchPlan.length === 0 || isGeneratingPlan) return;

    const executeSearches = async () => {
      setIsExecutingSearches(true);
      
      for (let i = 0; i < researchPlan.length; i++) {
        const step = researchPlan[i];
        setCurrentStepIndex(i);
        
        // Update step status to active
        setResearchPlan(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'active' } : s
        ));

        try {
          // Execute search for this step
          const searchResponse = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              q: step.query,
              mode: step.mode 
            })
          });

          if (!searchResponse.ok) throw new Error(`Failed to search: ${step.query}`);
          
          const searchData: SerperResponse = await searchResponse.json();
          let results: SearchResult[] = [];

          // Handle different response formats
          if (step.mode === 'news') {
            results = Array.isArray(searchData) ? searchData : searchData.news || [];
          } else if (step.mode === 'web') {
            results = searchData.organic || [];
          } else if (step.mode === 'shopping') {
            results = Array.isArray(searchData) ? searchData : searchData.shopping || [];
          } else if (step.mode === 'scholar' || step.mode === 'patents') {
            results = Array.isArray(searchData) ? searchData : searchData.organic || [];
          } else {
            results = searchData[step.mode] || [];
          }

          // Update step with results and mark as completed
          setResearchPlan(prev => prev.map((s, index) => 
            index === i ? { ...s, results, status: 'completed' } : s
          ));

          // Add results to all results
          setAllResults(prev => [...prev, ...results]);

        } catch (error) {
          console.error(`Error executing search for step ${i}:`, error);
          setResearchPlan(prev => prev.map((s, index) => 
            index === i ? { ...s, status: 'error' } : s
          ));
        }

        // Small delay between searches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setIsExecutingSearches(false);
    };

    executeSearches();
  }, [researchPlan, isGeneratingPlan]);

  // Generate final report
  useEffect(() => {
    if (isExecutingSearches || allResults.length === 0) return;

    const generateReport = async () => {
      try {
        setIsGeneratingReport(true);
        
        const response = await fetch('/api/deep-research/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query,
            researchPlan,
            allResults,
            mode
          })
        });

        if (!response.ok) throw new Error('Failed to generate report');
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let result = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.content) {
                  result += data.content;
                  setAiResponse(result);
                }
                             } catch {
                 // Ignore parsing errors for incomplete JSON
               }
            }
          }
        }

        setIsGeneratingReport(false);
        setIsComplete(true);
      } catch (error) {
        console.error('Error generating report:', error);
        setAiError(error instanceof Error ? error.message : 'Failed to generate report');
        setIsGeneratingReport(false);
      }
    };

    generateReport();
  }, [isExecutingSearches, allResults, query, researchPlan, mode]);

  // Convert research plan to stepper steps
  const stepperSteps: StepperStep[] = [
    {
      id: 'planning',
      title: 'Planning',
      description: 'Generating research strategy',
      status: isGeneratingPlan ? 'active' : 'completed'
    },
    ...researchPlan.map((step, index) => ({
      id: step.id,
      title: step.query.length > 30 ? step.query.substring(0, 30) + '...' : step.query,
      description: `${step.mode} search`,
      status: step.status
    })),
    {
      id: 'report',
      title: 'Report',
      description: 'Generating final analysis',
      status: isGeneratingReport ? 'active' : isComplete ? 'completed' : 'pending'
    }
  ];

  const currentStep = isGeneratingPlan ? 0 : 
                     isExecutingSearches ? currentStepIndex + 1 : 
                     isGeneratingReport ? stepperSteps.length - 1 : 
                     stepperSteps.length - 1;

  if (!query) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Deep Research</h1>
          <p className="text-gray-600">No query provided for deep research.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Deep Research</h1>
          </div>
          <p className="text-gray-600 mb-4">
            Comprehensive analysis of: <span className="font-semibold text-blue-600">&quot;{query}&quot;</span>
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-blue-200">
          <Stepper steps={stepperSteps} currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Results */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-blue-200">
              <div className="p-6 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Research Report</h2>
                  </div>
                  <button
                    onClick={() => setIsResultsExpanded(!isResultsExpanded)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {isResultsExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>
              
              {isResultsExpanded && (
                <div className="p-6">
                  {isGeneratingPlan && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-blue-600">Generating research plan...</span>
                      </div>
                    </div>
                  )}

                  {isExecutingSearches && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-blue-600">
                          Executing search {currentStepIndex + 1} of {researchPlan.length}...
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: {researchPlan[currentStepIndex]?.query}
                      </div>
                    </div>
                  )}

                  {isGeneratingReport && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-blue-600">Generating comprehensive report...</span>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600">Error: {aiError}</p>
                    </div>
                  )}

                  {aiResponse && (
                    <Results
                      isAiLoading={isGeneratingReport}
                      aiResponse={aiResponse}
                      aiError={aiError}
                      isAiComplete={isComplete}
                      searchResults={null}
                      mode={mode}
                      generateSearchId={(q, m) => `${q}-${m}`}
                      getWebsiteName={getWebsiteName}
                      searchTerm={query}
                      sources={allResults}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sources Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-blue-200">
              <div className="p-6 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
                  </div>
                  <button
                    onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {isSourcesExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>
              
              {isSourcesExpanded && (
                <div className="p-6">
                  <div className="space-y-4">
                                         {researchPlan.map((step) => (
                       <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            step.status === 'completed' ? 'bg-green-500' :
                            step.status === 'active' ? 'bg-blue-500' :
                            step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                                                     <span className="text-sm font-medium text-gray-900">
                             {step.mode}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{step.query}</p>
                        {step.results.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {step.results.length} results found
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeepResearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    }>
      <DeepResearchContent />
    </Suspense>
  );
}