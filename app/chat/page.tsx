'use client';

import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { MicrophoneButton } from '@/components/ui/microphone-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

// Model configuration - All models via OpenRouter
const models = [
  {
    id: 'openai/gpt-4o',
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    description: 'Fast, high-quality general-purpose model (OpenAI)'
  },
  {
    id: 'openai/gpt-4.1',
    name: 'gpt-4.1',
    displayName: 'GPT-4.1',
    description: 'Optimized for writing, reasoning, and complex tasks (OpenAI)'
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'gpt-4.1-mini',
    displayName: 'GPT-4.1 Mini',
    description: 'Lightweight, fast, and cost-efficient variant (OpenAI)'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Fastest Gemini model for quick responses (Google)'
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Handles long contexts; ideal for large documents (Google)'
  },
];

// Utility to clean up markdown tables (remove trailing pipes, trim whitespace)
function cleanMarkdownTables(markdown: string): string {
  return markdown
    .split('\n')
    .map(line => {
      // Remove trailing pipe if present and not just a single pipe
      if (line.trim().startsWith('|') && line.trim().endsWith('|') && line.trim() !== '|') {
        return line.replace(/\|\s*$/, '');
      }
      return line;
    })
    .join('\n');
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyMessage = async (content: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageIndex);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleTranscriptReceived = (transcript: string) => {
    setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      model: selectedModel
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add an empty assistant message that we'll update as we receive chunks
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      model: selectedModel
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content += parsed.content;
                  }
                  return newMessages;
                });
              }
            } catch {
              // Ignore parsing errors for incomplete JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = 'Sorry, I encountered an error while processing your request. Please try again.';
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex flex-col">
      {/* Model Selection Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700 apple-ui">Model:</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-64 md:w-80 rounded-2xl border border-gray-200/60 hover:border-orange-400/60 focus:border-orange-500/60 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md">
                <SelectValue placeholder="Select Model" className="apple-ui">
                  {models.find(model => model.id === selectedModel)?.displayName || 'Select Model'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-96 rounded-2xl border border-gray-200/60 shadow-xl bg-white/95 backdrop-blur-sm">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="py-4 rounded-xl mx-2 my-1 hover:bg-orange-50/80 focus:bg-orange-50/80 transition-colors">
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold text-sm apple-ui">{model.displayName}</span>
                      <span className="text-xs text-gray-500 leading-relaxed apple-ui">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 min-h-0">
        <div className="max-w-4xl mx-auto space-y-6 w-full">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <Bot className="h-16 w-16 text-orange-600 mx-auto mb-6 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 apple-ui">
                Welcome to rSearch Chat
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto px-4 apple-ui leading-relaxed">
                Ask me anything! I&apos;m here to help with your questions, provide detailed explanations, and assist with various topics.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className="flex gap-4">
              {message.role === 'user' ? (
                // User message - polished chat bubble style
                <div className="flex-1 flex justify-end">
                  <div className="max-w-[80%] lg:max-w-[70%]">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl rounded-br-lg px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                      <p className="text-sm leading-relaxed apple-ui font-medium">{message.content}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-500 apple-ui font-medium">You</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Assistant message - polished card with serif font for content
                <div className="flex-1">
                  <div className="apple-card p-8 w-full max-w-[90vw]">
                    <div className="prose prose-orange max-w-none w-full overflow-hidden">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({...props}) => (
                            <h1 {...props} className="text-3xl font-bold text-orange-600 mb-6 apple-text" />
                          ),
                          h2: ({...props}) => (
                            <h2 {...props} className="text-2xl font-bold text-orange-600 mt-8 mb-4 apple-text" />
                          ),
                          h3: ({...props}) => (
                            <h3 {...props} className="text-xl font-bold text-orange-600 mt-6 mb-3 apple-text" />
                          ),
                          h4: ({...props}) => (
                            <h4 {...props} className="text-lg font-bold text-orange-600 mt-6 mb-3 apple-text" />
                          ),
                          h5: ({...props}) => (
                            <h5 {...props} className="text-base font-bold text-orange-600 mt-6 mb-3 apple-text" />
                          ),
                          h6: ({...props}) => (
                            <h6 {...props} className="text-base font-bold text-orange-600 mt-6 mb-3 apple-text" />
                          ),
                          table: ({...props}) => (
                            <div className="w-full overflow-x-auto my-8 rounded-2xl border border-gray-200/60 shadow-lg max-w-full">
                              <div className="min-w-max max-w-full">
                                <table {...props} className="w-full divide-y divide-gray-200/60" />
                              </div>
                            </div>
                          ),
                          thead: ({...props}) => (
                            <thead {...props} className="bg-gradient-to-r from-orange-50/80 to-orange-100/80" />
                          ),
                          tbody: ({...props}) => (
                            <tbody {...props} className="bg-white divide-y divide-gray-200/60" />
                          ),
                          tr: ({...props}) => (
                            <tr {...props} className="hover:bg-orange-50/40 transition-colors duration-200" />
                          ),
                          th: ({...props}) => (
                            <th {...props} className="px-6 py-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider apple-ui" />
                          ),
                          td: ({...props}) => (
                            <td {...props} className="px-6 py-4 text-sm text-gray-700 whitespace-normal apple-text" />
                          ),
                          p: ({children, ...props}) => (
                            <p {...props} className="text-gray-700 mb-6 leading-relaxed apple-text text-base">{children}</p>
                          ),
                          ul: ({...props}) => (
                            <ul {...props} className="list-disc pl-8 mb-6 space-y-3 marker:text-orange-500" />
                          ),
                          ol: ({...props}) => (
                            <ol {...props} className="list-decimal pl-8 mb-6 space-y-3 marker:text-orange-500" />
                          ),
                          li: ({...props}) => (
                            <li {...props} className="text-gray-700 apple-text" />
                          ),
                          a: ({...props}) => (
                            <a 
                              {...props} 
                              className="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-200 hover:decoration-orange-500 transition-colors apple-text"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          blockquote: ({...props}) => (
                            <blockquote {...props} className="border-l-4 border-orange-300 pl-6 italic my-6 text-gray-600 bg-orange-50/40 py-4 rounded-r-2xl apple-text" />
                          ),
                          strong: ({...props}) => (
                            <strong {...props} className="font-bold text-orange-600 apple-text" />
                          ),
                          em: ({...props}) => (
                            <em {...props} className="italic text-orange-600/90 font-semibold apple-text" />
                          ),
                          pre: ({children, ...props}) => {
                            const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
                            if (child?.props?.className) {
                              const language = child.props.className.replace('language-', '');
                              const codeContent = String(child.props.children || '');
                              return (
                                <div className="my-8">
                                  <SyntaxHighlighter
                                    style={tomorrow}
                                    language={language}
                                    customStyle={{
                                      margin: 0,
                                      borderRadius: '12px',
                                      fontSize: '14px',
                                      lineHeight: '1.6',
                                    }}
                                  >
                                    {codeContent}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            }
                            return (
                              <pre {...props} className="bg-gray-900 text-gray-100 rounded-2xl p-6 overflow-x-auto my-6 text-sm font-mono">
                                {children}
                              </pre>
                            );
                          },
                          code: ({children, className, ...props}) => {
                            if (className && className.startsWith('language-')) {
                              return null; // Handled by pre component
                            }
                            return (
                              <code {...props} className="bg-orange-100/80 text-orange-800 rounded-lg px-3 py-1.5 text-sm font-mono">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {cleanMarkdownTables(message.content)}
                      </Markdown>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100/60">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 apple-ui font-medium">
                          Model {models.find(model => model.id === message.model)?.name || 'Unknown'}
                        </span>
                      </div>
                      <button
                        onClick={() => copyMessage(message.content, index)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50/80 rounded-xl transition-all duration-200 apple-ui font-medium"
                      >
                        {copiedMessageId === index ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form - Apple-style polished design */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/60 px-6 py-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="apple-input"
                disabled={isLoading}
              />
              {/* Microphone Button */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <MicrophoneButton onTranscriptReceived={handleTranscriptReceived} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="apple-button flex items-center justify-center min-w-[60px]"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}