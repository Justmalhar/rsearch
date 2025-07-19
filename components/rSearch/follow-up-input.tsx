'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

  const submitQuestion = () => {
    if (!currentQuestion.trim()) return;

    const questionText = currentQuestion.trim();
    setCurrentQuestion('');
    setShowQuestionInput(false); // Hide the input form
    onSubmitQuestion(questionText);
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion();
    }
  };

  if (!isVisible || isProcessing) return null;

  return (
    <>
      {/* Sticky Bottom Input */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${isMobile ? '' : 'pl-32'}`}>
        {!showQuestionInput ? (
          // Show follow-up button
          <div className="bg-white/95 backdrop-blur-sm border-t border-orange-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <MessageCirclePlus className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-orange-600 font-medium font-serif text-lg">Ask a follow-up question</span>
                </div>
                <Button
                  onClick={() => setShowQuestionInput(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6"
                >
                  Ask Question
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Show input form
                      <div className="bg-white border-t border-orange-200 p-6 shadow-2xl">
            <div className="max-w-7xl mx-auto">
              <form onSubmit={handleSubmitQuestion} className="flex gap-3 items-end">
                <Textarea
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask a follow-up question about "${originalSearchTerm}"... (Press Enter to submit, Shift+Enter for new line)`}
                  className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400 font-serif text-lg rounded-2xl px-4 py-3 resize-none"
                  rows={2}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!currentQuestion.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4"
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
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 rounded-full px-4"
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