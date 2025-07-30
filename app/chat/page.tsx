'use client';

import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Bot, User, Copy, Check } from 'lucide-react';
import { MicrophoneButton } from '@/components/ui/microphone-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

// Model configuration
const models = [
  {
    id: 'openai/gpt-4o',
    name: 'gpt-4o',
    displayName: 'gpt-4o',
    description: 'Fast, high-quality, general-purpose model from OpenAI.'
  },
  {
    id: 'openai/gpt-4.1',
    name: 'gpt-4.1',
    displayName: 'gpt-4.1',
    description: 'Best for writing, reasoning, and complex tasks (OpenAI).'
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'gpt-4.1-mini',
    displayName: 'gpt-4.1-mini',
    description: 'Fast, lightweight, cost-effective (OpenAI).'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    displayName: 'gemini-2.5-flash',
    description: 'Fastest Gemini model, great for quick responses (Google).'
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'gemini-2.5-pro',
    displayName: 'gemini-2.5-pro',
    description: 'Largest context, best for long documents (Google).'
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Model Selection Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Model:</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
                              <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Model">
                    {models.find(model => model.id === selectedModel)?.displayName || 'Select Model'}
                  </SelectValue>
                </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between">
                      <span>{model.displayName}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
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
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 w-full max-w-[90vw]">
                    <div className="prose prose-orange max-w-none w-full overflow-hidden">
                      <Markdown
                        remarkPlugins={[remarkGfm]}
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
                            <div className="w-full overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm max-w-full">
                              <div className="min-w-max max-w-full">
                                <table {...props} className="w-full divide-y divide-gray-200" />
                              </div>
                            </div>
                          ),
                          thead: ({...props}) => (
                            <thead {...props} className="bg-gradient-to-r from-orange-50 to-orange-100" />
                          ),
                          tbody: ({...props}) => (
                            <tbody {...props} className="bg-white divide-y divide-gray-200" />
                          ),
                          tr: ({...props}) => (
                            <tr {...props} className="hover:bg-orange-50/30 transition-colors duration-200" />
                          ),
                          th: ({...props}) => (
                            <th {...props} className="px-6 py-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider" />
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
                            <blockquote {...props} className="border-l-4 border-orange-300 pl-4 italic my-4 text-gray-600 bg-orange-50/30 py-2 rounded-r" />
                          ),
                          strong: ({...props}) => (
                            <strong {...props} className="font-bold text-orange-600" />
                          ),
                          em: ({...props}) => (
                            <em {...props} className="italic text-orange-600/90 font-semibold" />
                          ),
                          pre: ({children, ...props}) => {
                            const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
                            if (child?.props?.className) {
                              const language = child.props.className.replace('language-', '');
                              const codeContent = String(child.props.children || '');
                              return (
                                <div className="my-6">
                                  <SyntaxHighlighter
                                    style={tomorrow}
                                    language={language}
                                    customStyle={{
                                      margin: 0,
                                      borderRadius: '8px',
                                      fontSize: '14px',
                                      lineHeight: '1.5',
                                    }}
                                  >
                                    {codeContent}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            }
                            return (
                              <pre {...props} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono">
                                {children}
                              </pre>
                            );
                          },
                          code: ({children, className, ...props}) => {
                            if (className && className.startsWith('language-')) {
                              return null; // Handled by pre component
                            }
                            return (
                              <code {...props} className="bg-orange-100 text-orange-800 rounded px-2 py-1 text-sm font-mono">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {cleanMarkdownTables(message.content)}
                      </Markdown>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-orange-600" />
                        <span className="text-xs text-gray-500">
                          Model {models.find(model => model.id === message.model)?.name || 'Unknown'}
                        </span>
                      </div>
                      <button
                        onClick={() => copyMessage(message.content, index)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
              {/* Microphone Button */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <MicrophoneButton onTranscriptReceived={handleTranscriptReceived} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}