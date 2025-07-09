'use client';

import { useEffect, useState } from 'react';

type ResearchState = 'initializing' | 'generating_queries' | 'searching' | 'processing' | 'going_deeper' | 'generating_report' | 'completed' | 'error';

interface ResearchProgressProps {
  reasoningContent?: string | null;
  state?: ResearchState;
  metadata?: Record<string, unknown>;
}

export default function ResearchProgress({ reasoningContent, state, metadata }: ResearchProgressProps) {
  const [formattedContent, setFormattedContent] = useState<string[]>([]);

  useEffect(() => {
    if (reasoningContent) {
      // Split content by newlines and filter out empty lines
      const lines = reasoningContent
        .split('\n')
        .filter(line => line.trim().length > 0);
      setFormattedContent(lines);
    }
  }, [reasoningContent]);

  const getLineStyle = (line: string) => {
    if (line.includes('🚀') || line.startsWith('Starting')) {
      return {
        dot: 'bg-blue-50 border-blue-400',
        text: 'text-blue-600 font-semibold'
      };
    }
    if (line.includes('🧠') || line.includes('Generating')) {
      return {
        dot: 'bg-purple-50 border-purple-400',
        text: 'text-purple-600 font-semibold'
      };
    }
    if (line.includes('🔍') || line.includes('Researching:')) {
      return {
        dot: 'bg-orange-100 border-orange-500',
        text: 'text-orange-600 font-medium'
      };
    }
    if (line.includes('📊') || line.includes('Processing')) {
      return {
        dot: 'bg-gray-100 border-gray-400',
        text: 'text-gray-600 italic'
      };
    }
    if (line.includes('🔬') || line.includes('Going deeper')) {
      return {
        dot: 'bg-orange-200 border-orange-600', 
        text: 'text-orange-700 font-bold'
      };
    }
    if (line.includes('📝') || line.includes('Generating') || line.includes('report')) {
      return {
        dot: 'bg-green-100 border-green-500',
        text: 'text-green-600 font-medium'
      };
    }
    if (line.includes('✅') || line.includes('completed')) {
      return {
        dot: 'bg-green-200 border-green-600',
        text: 'text-green-700 font-bold'
      };
    }
    if (line.includes('❌') || line.includes('failed') || line.includes('error')) {
      return {
        dot: 'bg-red-100 border-red-500',
        text: 'text-red-600 font-semibold'
      };
    }
    if (line.includes('💡') || line.includes('insights')) {
      return {
        dot: 'bg-yellow-100 border-yellow-500',
        text: 'text-yellow-700 font-medium'
      };
    }
    if (line.includes('🔗') || line.includes('sources')) {
      return {
        dot: 'bg-indigo-100 border-indigo-500',
        text: 'text-indigo-600 font-medium'
      };
    }
    return {
      dot: 'bg-gray-50 border-gray-300',
      text: 'text-gray-700'
    };
  };

  const getStateColor = (currentState?: ResearchState) => {
    switch (currentState) {
      case 'initializing': return 'text-blue-600';
      case 'generating_queries': return 'text-purple-600';
      case 'searching': return 'text-orange-600';
      case 'processing': return 'text-gray-600';
      case 'going_deeper': return 'text-orange-700';
      case 'generating_report': return 'text-green-600';
      case 'completed': return 'text-green-700';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {(reasoningContent || state || metadata) && (
        <div className="mt-8">
          <div className="bg-gray-50/50 hover:bg-gray-100/50 rounded-lg p-6 max-w-[66vw]">
            {/* Metadata display */}
            {metadata && (
              <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Research Metadata</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {metadata.query && <p><strong>Query:</strong> {String(metadata.query)}</p>}
                  {metadata.breadthUsed && <p><strong>Breadth:</strong> {String(metadata.breadthUsed)}</p>}
                  {metadata.depthUsed && <p><strong>Depth:</strong> {String(metadata.depthUsed)}</p>}
                  {metadata.totalLearnings && <p><strong>Total Insights:</strong> {String(metadata.totalLearnings)}</p>}
                  {metadata.totalSources && <p><strong>Total Sources:</strong> {String(metadata.totalSources)}</p>}
                  {metadata.currentDepth !== undefined && <p><strong>Current Depth:</strong> {String(metadata.currentDepth)}</p>}
                  {metadata.maxDepth && <p><strong>Max Depth:</strong> {String(metadata.maxDepth)}</p>}
                </div>
              </div>
            )}

            {/* Current state display */}
            {state && (
              <div className="mb-4">
                <p className={`text-sm font-medium ${getStateColor(state)}`}>
                  Current State: {state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            )}

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-2.5 top-0 h-full w-0.5 bg-orange-200" />
              
              <div className="space-y-6">
                {formattedContent.map((line, i) => {
                  const styles = getLineStyle(line);
                  const uniqueKey = `${line.slice(0, 20)}-${i}`;

                  return (
                    <div key={uniqueKey} className="relative flex items-start gap-6 pl-8">
                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 ${styles.dot}`} />

                      {/* Content */}
                      <div className={`flex-1 transition-all duration-200 break-words overflow-wrap-anywhere ${styles.text} leading-relaxed`}>
                        {line}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
