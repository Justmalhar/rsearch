import React from 'react';
import type { AcademicSearchResult } from '@/types/search';

interface ScholarSourcesProps {
  sources: (AcademicSearchResult & {
    pdfUrl?: string;
    citations?: number;
    publicationInfo?: string;
  })[];
  displayCount?: number;
}

export default function ScholarSources({ sources, displayCount = 10 }: ScholarSourcesProps) {

  return (
    <div className="group relative flex min-h-[100px] w-full items-stretch">
      <div className="flex flex-col w-full rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition duration-300">
        {sources.slice(0, displayCount).map((source) => (
          <div key={source.link} className="relative flex max-w-full select-none flex-col justify-between p-3">
            {/* Title and Link */}
            <div className="flex items-start gap-2">
              <div className="flex-none">
                <div className="relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 rounded-full bg-white" />
                  <img
                    src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(source.link).hostname}`}
                    alt={`Favicon for ${new URL(source.link).hostname}`}
                    width="20"
                    height="20"
                    className="relative block w-5 h-5"
                  />
                  <div className="absolute inset-0 rounded-full border border-black/10" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline line-clamp-2"
                >
                  {source.title}
                </a>
                
                {/* Publication Info */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
                  {source.publicationInfo ? (
                    <span>{source.publicationInfo}</span>
                  ) : (
                    <>
                      {source.authors && source.authors.length > 0 && (
                        <>
                          <span className="text-blue-500">Authors:</span>
                          <span>{source.authors.join(', ')}</span>
                        </>
                      )}
                      {source.publisher && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-blue-500">Publisher:</span>
                          <span>{source.publisher}</span>
                        </>
                      )}
                    </>
                  )}
                  {source.year && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-500">Year:</span>
                      <span>{source.year}</span>
                    </>
                  )}
                  {source.citations && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-500">Citations:</span>
                      <span>{source.citations}</span>
                    </>
                  )}
                </div>

                {/* Snippet/Abstract */}
                {source.snippet && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {source.snippet}
                  </p>
                )}

                {/* PDF Link if available */}
                {'pdfUrl' in source && source.pdfUrl && (
                  <div className="mt-2">
                    <a
                      href={source.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                      >
                        <title>PDF document</title>
                        <desc>Icon representing a PDF document</desc>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
