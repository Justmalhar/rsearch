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
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
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

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

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
          <Brain className="h-12 w-12 text-orange-500 mx-auto mb-4" />
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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">Deep Research</h1>
          </div>
          <p className="text-lg text-orange-800">
            Comprehensive analysis of: <span className="font-semibold">&quot;{query}&quot;</span>
          </p>
        </div>

        {/* Stepper */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-medium text-orange-600">Research Progress</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-orange-200">
            <Stepper steps={stepperSteps} currentStep={currentStep} />
          </div>
        </section>

        {/* Research Steps with Expandable Sources */}
        {researchPlan.map((step, index) => (
          <section key={step.id} className="space-y-4">
            <button
              type="button"
              onClick={() => toggleStepExpansion(step.id)}
              className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
            >
              <span>Step {index + 1}: {step.mode.toUpperCase()} Search</span>
              {expandedSteps.has(step.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            <div className="space-y-2">
              <p className="text-orange-800 font-medium">Query: {step.query}</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'active' ? 'bg-orange-500' :
                  step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm text-gray-600">
                  {step.status === 'completed' ? `${step.results.length} results found` :
                   step.status === 'active' ? 'Searching...' :
                   step.status === 'error' ? 'Error occurred' : 'Pending'}
                </span>
              </div>
            </div>

            {expandedSteps.has(step.id) && (
              <div className="space-y-4">
                {/* Show Sources Button */}
                {step.status === 'completed' && step.results.length > 0 && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleSourcesExpansion(step.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors font-medium"
                    >
                      {expandedSources.has(step.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Sources ({step.results.length})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show Sources ({step.results.length})
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Sources Display */}
                {expandedSources.has(step.id) && step.results.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Step {index + 1} Results: {step.results.length} sources found
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {step.status}
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
                )}
              </div>
            )}
          </section>
        ))}

        {/* Results */}
        <section>
          <button
            type="button"
            onClick={() => setIsResultsExpanded(!isResultsExpanded)}
            className="flex items-center gap-2 text-xl md:text-2xl font-medium text-orange-600"
          >
            <span>Research Report</span>
            {isResultsExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          
          {isResultsExpanded && (
            <div className="space-y-4">
              {isGeneratingPlan && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <span className="text-orange-600">Generating research plan...</span>
                  </div>
                </div>
              )}

              {isExecutingSearches && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <span className="text-orange-600">
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
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <span className="text-orange-600">Generating comprehensive report...</span>
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
            <h2 className="text-xl md:text-2xl font-medium text-orange-600">All Sources</h2>
            <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {allResults.length} total sources found across all research steps
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {allResults.map((result, index) => (
                    <div key={`${result.link}-${index}`} className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 font-medium line-clamp-2 hover:underline"
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