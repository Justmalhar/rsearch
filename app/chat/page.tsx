'use client';

import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-orange-600" />
            rSearch Chat
          </h1>
          <p className="text-gray-600 mt-1">
            Chat with our AI assistant powered by rSearch
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to rSearch Chat
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Ask me anything! I&apos;m here to help with your questions, provide detailed explanations, and assist with various topics.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className="flex gap-3">
              {message.role === 'user' ? (
                // User message - chat bubble style
                <div className="flex-1 flex justify-end">
                  <div className="max-w-[80%] lg:max-w-[70%]">
                    <div className="bg-orange-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">You</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Assistant message - full width with markdown styling
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="prose prose-orange max-w-none">
                      <Markdown
                        components={{
                          h1: ({...props}) => (
                            <h1 {...props} className="text-2xl font-bold text-orange-600 mb-4" />
                          ),
                          h2: ({...props}) => (
                            <h2 {...props} className="text-xl font-bold text-orange-600 mt-6 mb-3" />
                          ),
                          h3: ({...props}) => (
                            <h3 {...props} className="text-lg font-bold text-orange-600 mt-4 mb-2" />
                          ),
                          h4: ({...props}) => (
                            <h4 {...props} className="text-base font-bold text-orange-600 mt-4 mb-2" />
                          ),
                          h5: ({...props}) => (
                            <h5 {...props} className="text-base font-bold text-orange-600 mt-4 mb-2" />
                          ),
                          h6: ({...props}) => (
                            <h6 {...props} className="text-base font-bold text-orange-600 mt-4 mb-2" />
                          ),
                          table: ({...props}) => (
                            <div className="overflow-x-auto">
                              <table {...props} className="min-w-full divide-y divide-gray-200 border border-gray-200" />
                            </div>
                          ),
                          thead: ({...props}) => (
                            <thead {...props} className="bg-orange-50" />
                          ),
                          tbody: ({...props}) => (
                            <tbody {...props} className="bg-white divide-y divide-gray-200" />
                          ),
                          tr: ({...props}) => (
                            <tr {...props} className="hover:bg-orange-50/50 transition-colors" />
                          ),
                          th: ({...props}) => (
                            <th {...props} className="px-6 py-3 text-left text-sm font-semibold text-orange-600" />
                          ),
                          td: ({...props}) => (
                            <td {...props} className="px-6 py-4 text-sm text-gray-700 whitespace-normal" />
                          ),
                          p: ({children, ...props}) => (
                            <p {...props} className="text-gray-700 mb-4 leading-relaxed">{children}</p>
                          ),
                          ul: ({...props}) => (
                            <ul {...props} className="list-disc pl-6 mb-4 space-y-2 marker:text-orange-500" />
                          ),
                          ol: ({...props}) => (
                            <ol {...props} className="list-decimal pl-6 mb-4 space-y-2 marker:text-orange-500" />
                          ),
                          li: ({...props}) => (
                            <li {...props} className="text-gray-700" />
                          ),
                          a: ({...props}) => (
                            <a 
                              {...props} 
                              className="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-200 hover:decoration-orange-500 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          blockquote: ({...props}) => (
                            <blockquote {...props} className="border-l-4 border-orange-200 pl-4 italic my-4 text-gray-600" />
                          ),
                          strong: ({...props}) => (
                            <strong {...props} className="font-bold text-orange-600" />
                          ),
                          em: ({...props}) => (
                            <em {...props} className="italic text-orange-600/90 font-semibold" />
                          ),
                          pre: ({...props}) => (
                            <pre {...props} className="bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-sm font-mono" />
                          ),
                          code: ({...props}) => (
                            <code {...props} className="bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-sm font-mono" />
                          ),
                        }}
                      >
                        {message.content}
                      </Markdown>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Bot className="h-4 w-4 text-orange-600" />
                      <span className="text-xs text-gray-500">rSearch Assistant</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-600 text-sm">rSearch is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="rounded-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}