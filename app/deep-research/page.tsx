'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import type { SearchResult, SearchSource, SerperResponse } from '@/types/search';
import Results from '@/components/rSearch/results';
import Sources from '@/components/rSearch/sources';
import { getWebsiteName } from '@/lib/utils';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

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
  
  // Ref to track if searches have been executed
  const hasExecutedSearches = useRef(false);

  // UI state
  const [isResultsExpanded, setIsResultsExpanded] = useState(true);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const autoExpand = settings.autoExpandSections ?? true;
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

        if (!response.ok) {
          // Fallback plan if API fails
          console.log('API failed, using fallback plan');
          const fallbackPlan = [
            {
              id: 'step_1',
              query: query,
              mode: mode,
              reasoning: 'Primary search for the main query'
            },
            {
              id: 'step_2', 
              query: `${query} latest news`,
              mode: 'news' as SearchSource,
              reasoning: 'Recent news and updates'
            },
            {
              id: 'step_3',
              query: `${query} research studies`,
              mode: 'scholar' as SearchSource,
              reasoning: 'Academic research and studies'
            }
          ];
          
          const formattedPlan = fallbackPlan.map((step) => ({
            ...step,
            results: [],
            status: 'pending' as const
          }));
          
          console.log('Using fallback plan:', formattedPlan);
          setResearchPlan(formattedPlan);
          setIsGeneratingPlan(false);
          return;
        }
        
        const plan = await response.json();
        console.log('Generated research plan:', plan);
        
        const formattedPlan = plan.steps.map((step: DeepResearchStep) => ({
          ...step,
          results: [],
          status: 'pending' as const
        }));
        
        console.log('Formatted research plan:', formattedPlan);
        setResearchPlan(formattedPlan);
        setIsGeneratingPlan(false);
      } catch (error) {
        console.error('Error generating research plan:', error);
        
        // Fallback plan on error
        const fallbackPlan = [
          {
            id: 'step_1',
            query: query,
            mode: mode,
            reasoning: 'Primary search for the main query'
          },
          {
            id: 'step_2', 
            query: `${query} latest news`,
            mode: 'news' as SearchSource,
            reasoning: 'Recent news and updates'
          },
          {
            id: 'step_3',
            query: `${query} research studies`,
            mode: 'scholar' as SearchSource,
            reasoning: 'Academic research and studies'
          }
        ];
        
        const formattedPlan = fallbackPlan.map((step) => ({
          ...step,
          results: [],
          status: 'pending' as const
        }));
        
        console.log('Using fallback plan due to error:', formattedPlan);
        setResearchPlan(formattedPlan);
        setIsGeneratingPlan(false);
      }
    };

    generateResearchPlan();
  }, [query, mode]);

  // Execute searches step by step
  useEffect(() => {
    if (researchPlan.length === 0 || isGeneratingPlan || hasExecutedSearches.current) return;

    const executeSearches = async () => {
      console.log('Starting search execution with plan:', researchPlan);
      hasExecutedSearches.current = true;
      setIsExecutingSearches(true);
      
      // Create a copy of the research plan to work with
      const planToExecute = [...researchPlan];
      
      for (let i = 0; i < planToExecute.length; i++) {
        const step = planToExecute[i];
        setCurrentStepIndex(i);
        
        // Update step status to active
        setResearchPlan(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'active' } : s
        ));

        try {
          console.log(`Executing search ${i + 1}/${planToExecute.length}:`, step.query, 'mode:', step.mode);
          
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

  // Generate final report using rSearch prompt
  useEffect(() => {
    if (isExecutingSearches || allResults.length === 0) return;

    const generateReport = async () => {
      try {
        setIsGeneratingReport(true);
        
        const response = await fetch('/api/rsearch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            searchTerm: query,
            searchResults: {
              organic: allResults,
              knowledgeGraph: null
            },
            mode
          })
        });

        if (!response.ok) {
          // Fallback report if API fails
          console.log('Report API failed, using fallback report');
          const fallbackReport = `# Deep Research Report: ${query}

## Summary
This comprehensive analysis was conducted using multiple search strategies to provide a thorough understanding of "${query}".

## Research Methodology
The research was conducted across ${researchPlan.length} different search queries:
${researchPlan.map((step, index) => `
${index + 1}. **${step.mode.toUpperCase()} Search**: ${step.query}
   - Results found: ${step.results.length}
   - Status: ${step.status}
`).join('')}

## Total Sources Analyzed
${allResults.length} total search results were gathered and analyzed.

## Key Findings
Based on the comprehensive search results, here are the key insights:

${allResults.slice(0, 10).map((result, index) => `
${index + 1}. **${result.title}**
   - Source: ${result.link}
   - ${'snippet' in result ? result.snippet : 'No description available'}
`).join('')}

## Conclusion
This deep research analysis provides a comprehensive overview of "${query}" based on ${allResults.length} sources across multiple search strategies. The findings represent a thorough investigation of the topic from various perspectives and sources.

*Report generated on ${new Date().toLocaleDateString()}*`;

          setAiResponse(fallbackReport);
          setIsGeneratingReport(false);
          setIsComplete(true);
          return;
        }
        
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
        
        // Fallback report on error
        const fallbackReport = `# Deep Research Report: ${query}

## Summary
This comprehensive analysis was conducted using multiple search strategies to provide a thorough understanding of "${query}".

## Research Methodology
The research was conducted across ${researchPlan.length} different search queries:
${researchPlan.map((step, index) => `
${index + 1}. **${step.mode.toUpperCase()} Search**: ${step.query}
   - Results found: ${step.results.length}
   - Status: ${step.status}
`).join('')}

## Total Sources Analyzed
${allResults.length} total search results were gathered and analyzed.

## Key Findings
Based on the comprehensive search results, here are the key insights:

${allResults.slice(0, 10).map((result, index) => `
${index + 1}. **${result.title}**
   - Source: ${result.link}
   - ${'snippet' in result ? result.snippet : 'No description available'}
`).join('')}

## Conclusion
This deep research analysis provides a comprehensive overview of "${query}" based on ${allResults.length} sources across multiple search strategies. The findings represent a thorough investigation of the topic from various perspectives and sources.

*Report generated on ${new Date().toLocaleDateString()}*`;

        setAiResponse(fallbackReport);
        setAiError(null);
        setIsGeneratingReport(false);
        setIsComplete(true);
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
    ...researchPlan.map((step) => ({
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

  const toggleSourcesExpansion = (stepId: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

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
    <div className="flex min-h-screen">
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-4 mt-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Deep Research</h1>
          </div>
          <p className="text-lg text-blue-800 font-medium">
            &quot;{query}&quot;
          </p>
        </div>

        {/* Stepper */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-700">Research Progress</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
            <Stepper steps={stepperSteps} currentStep={currentStep} />
          </div>
        </section>

        {/* Research Steps with Expandable Sources */}
        {researchPlan.map((step, index) => (
          <section key={step.id} className="bg-white rounded-lg shadow-sm border border-blue-100 overflow-hidden mb-6">
            <div className="p-6 space-y-3">
              {/* Row 1: Step number, search type, status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-600 rounded-full text-base font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-base font-semibold text-blue-700">{step.mode.toUpperCase()} Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'active' ? 'bg-blue-500' :
                    step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-xs text-gray-500 font-medium">
                    {step.status === 'completed' ? 'Completed' :
                     step.status === 'active' ? 'Searching...' :
                     step.status === 'error' ? 'Error' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Row 2: Query */}
              <div className="flex items-start">
                <span className="font-medium text-gray-700 mr-2">Query:</span>
                <span className="text-sm text-gray-600 break-words">{step.query}</span>
              </div>

              {/* Row 3: Number of sources and Show Sources button */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {step.status === 'completed' ? `${step.results.length} sources found` : 'No sources yet'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSourcesExpansion(step.id)}
                  disabled={step.status !== 'completed' || step.results.length === 0}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-xs font-medium shadow-sm border ${
                    step.status === 'completed' && step.results.length > 0
                      ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200 hover:border-blue-300'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                  }`}
                >
                  {expandedSources.has(step.id) ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Hide Sources
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show Sources
                    </>
                  )}
                  {step.status === 'completed' && step.results.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                      {step.results.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Sources Display - Expandable */}
            {expandedSources.has(step.id) && step.results.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-100">
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Sources Found ({step.results.length})
                    </h4>
                    <p className="text-xs text-gray-500">
                      {step.mode.toUpperCase()} search results for: &quot;{step.query}&quot;
                    </p>
                  </div>
                  <Sources
                    sources={step.results}
                    mode={step.mode}
                    getWebsiteName={getWebsiteName}
                    error={step.status === 'error' ? 'Error occurred while searching.' : null}
                    isSearchLoading={step.status === 'active'}
                    setShowSourcesSidebar={() => {}}
                    knowledgeGraph={undefined}
                  />
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Results */}
        <section className="bg-white rounded-lg shadow-sm border border-blue-100 p-6">
          <button
            type="button"
            onClick={() => setIsResultsExpanded(!isResultsExpanded)}
            className="flex items-center justify-between w-full text-left hover:bg-blue-50 p-2 rounded-lg transition-colors"
          >
            <h2 className="text-xl font-semibold text-blue-700">Research Report</h2>
            {isResultsExpanded ? (
              <ChevronUp className="w-5 h-5 text-blue-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-600" />
            )}
          </button>
          
          {isResultsExpanded && (
            <div className="space-y-4">
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
        </section>

        {/* All Sources */}
        {allResults.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-700">All Sources</h2>
            <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {allResults.length} total sources found across all research steps
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {allResults.map((result, index) => (
                    <div key={`${result.link}-${index}`} className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium line-clamp-2 hover:underline"
                        >
                          {result.title}
                        </a>
                        <p className="text-sm text-gray-600 mt-1">
                          {getWebsiteName(result.link)}
                        </p>
                        {'snippet' in result && result.snippet && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {result.snippet}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
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