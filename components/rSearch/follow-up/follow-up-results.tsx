'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Bot, ExternalLink } from 'lucide-react';
import Markdown from 'react-markdown';
import type { FollowUpQuestion } from './follow-up-chat';
import type { SearchSource } from '@/types/search';
import { getWebsiteName } from '@/lib/utils';

interface FollowUpResultsProps {
  question: FollowUpQuestion;
  mode: SearchSource;
}

export default function FollowUpResults({ question }: FollowUpResultsProps) {
  const [showSources, setShowSources] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  if (!question.aiResponse) return null;

  return (
    <div className="space-y-3">
      {/* AI Response */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="prose prose-sm max-w-none text-gray-800">
              <Markdown
                components={{
                  img: () => null, // Don't render images in follow-up responses
                }}
              >
                {question.aiResponse}
              </Markdown>
            </div>
          </div>
        </div>
      </Card>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* Thinking Section */}
        {question.reasoningContent && (
          <Card className="border-orange-200">
            <Button
              variant="ghost"
              onClick={() => setShowThinking(!showThinking)}
              className="w-full justify-between p-3 text-orange-600 hover:text-orange-700"
            >
              <span className="text-sm font-medium">Thinking</span>
              {showThinking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {showThinking && (
              <div className="px-3 pb-3">
                <div className="text-sm text-orange-700 whitespace-pre-wrap">
                  {question.reasoningContent}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Sources Section */}
        {question.sources && question.sources.length > 0 && (
          <Card className="border-orange-200">
            <Button
              variant="ghost"
              onClick={() => setShowSources(!showSources)}
              className="w-full justify-between p-3 text-orange-600 hover:text-orange-700"
            >
              <span className="text-sm font-medium">Sources ({question.sources.length})</span>
              {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {showSources && (
              <div className="px-3 pb-3 space-y-2">
                {question.sources.slice(0, 5).map((source, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg text-sm"
                  >
                    <span className="text-orange-600 font-medium min-w-[20px]">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-800 hover:text-orange-900 font-medium line-clamp-2 flex items-center gap-1"
                      >
                        {source.title}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <p className="text-orange-600 text-xs mt-1">
                        {getWebsiteName(source.link)}
                      </p>
                      {'snippet' in source && source.snippet && (
                        <p className="text-orange-700 text-xs mt-1 line-clamp-2">
                          {source.snippet}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}