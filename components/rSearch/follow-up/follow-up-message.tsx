'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Bot, AlertCircle } from 'lucide-react';
import type { FollowUpQuestion } from './follow-up-chat';

interface FollowUpMessageProps {
  question: FollowUpQuestion;
}

export default function FollowUpMessage({ question }: FollowUpMessageProps) {
  return (
    <div className="space-y-3">
      {/* User Question */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-orange-600" />
        </div>
        <Card className="flex-1 p-3 bg-orange-50 border-orange-200">
          <p className="text-sm text-orange-800">{question.question}</p>
          <p className="text-xs text-orange-600 mt-1">
            {question.timestamp.toLocaleTimeString()}
          </p>
        </Card>
      </div>

      {/* AI Response */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1">
          {question.isLoading ? (
            <Card className="p-3 bg-gray-50 border-gray-200">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ) : question.error ? (
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Error: {question.error}</span>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}