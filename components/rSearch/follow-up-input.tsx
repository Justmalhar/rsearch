'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCirclePlus, X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface FollowUpInputProps {
  isVisible: boolean;
  originalSearchTerm: string;
  onSubmitQuestion: (question: string) => void;
  isProcessing: boolean;
}

export default function FollowUpInput({
  isVisible,
  originalSearchTerm,
  onSubmitQuestion,
  isProcessing
}: FollowUpInputProps) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim()) return;

    const questionText = currentQuestion.trim();
    setCurrentQuestion('');
    setShowQuestionInput(false); // Hide the input form
    onSubmitQuestion(questionText);
  };

  if (!isVisible || isProcessing) return null;

  return (
    <>
      {/* Sticky Bottom Input */}
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

      {/* Bottom padding to prevent content from being hidden behind sticky input */}
      <div className="h-20"></div>
    </>
  );
}