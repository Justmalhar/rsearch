'use client';

import Markdown from 'react-markdown';

interface ThinkingProps {
  reasoningContent?: string | null;
}

export default function Thinking({ reasoningContent }: ThinkingProps) {

  return (
    <>
      {/* Thinking Section */}
      {reasoningContent && (
        <div className="mt-8">
            <div className="bg-muted/50 hover:bg-muted/70 rounded-lg p-6">
              <Markdown className="prose prose-orange max-w-none"
              components={{
                h1: (props) => (
                  <h1 {...props} className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4" />
                ),
                h2: (props) => (
                  <h2 {...props} className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-6 mb-3" />
                ),
                h3: (props) => (
                  <h3 {...props} className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-4 mb-2" />
                ),
                h4: (props) => (
                  <h4 {...props} className="text-base font-bold text-orange-600 dark:text-orange-400 mt-4 mb-2" />
                ),
                h5: (props) => (
                  <h5 {...props} className="text-base font-bold text-orange-600 dark:text-orange-400 mt-4 mb-2" />
                ),
                h6: (props) => (
                  <h6 {...props} className="text-base font-bold text-orange-600 dark:text-orange-400 mt-4 mb-2" />
                ),
                table: (props) => (
                  <table {...props} className="table-auto border-collapse border border-border" />
                ),
                thead: (props) => (
                  <thead {...props} className="bg-orange-50/50 dark:bg-orange-950/20" />
                ),
                tbody: (props) => (
                  <tbody {...props} className="bg-background" />
                ),
                tr: (props) => (
                  <tr {...props} className="border-b border-border" />
                ),
                th: (props) => (
                  <th {...props} className="px-4 py-2 text-left text-sm font-medium text-foreground" />
                ),
                                  td: (props) => (
                    <td {...props} className="px-4 py-2 text-sm text-muted-foreground" />
                  ),
                img: (props) => (
                  <img {...props} alt={props.alt || ''} className="w-full h-auto border-radius-md" />
                ),
                p: (props) => (
                  <p {...props} className="text-gray-700 mb-4 leading-relaxed" />
                ),
                ul: (props) => (
                  <ul {...props} className="list-disc pl-6 mb-4 space-y-2 marker:text-orange-500" />
                ),
                ol: (props) => (
                  <ol {...props} className="list-decimal pl-6 mb-4 space-y-2 marker:text-orange-500" />
                ),
                li: (props) => (
                  <li {...props} className="text-gray-700" />
                ),
                a: (props) => (
                  <a 
                    {...props} 
                    className="text-orange-600 hover:text-orange-700 font-medium underline decoration-orange-200 hover:decoration-orange-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                blockquote: (props) => (
                  <blockquote {...props} className="border-l-4 border-orange-200 pl-4 italic my-4 text-gray-600" />
                ),
                strong: (props) => (
                  <strong {...props} className="font-bold text-orange-600" />
                ),
                em: (props) => (
                  <em {...props} className="italic text-orange-600/90" />
                ),
                code: (props) => (
                  <code {...props} className="bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-sm font-mono" />
                ),
              }}
              >
                {reasoningContent}
              </Markdown>
            </div>
        </div>
      )}
    </>
  );
}
