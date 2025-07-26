import React from 'react';
import type { AcademicSearchResult } from '@/types/search';

interface PatentSourcesProps {
  sources: (AcademicSearchResult & {
    priorityDate?: string;
    filingDate?: string;
    grantDate?: string;
    publicationDate?: string;
    inventor?: string;
    assignee?: string;
    publicationNumber?: string;
    figures?: Array<{
      imageUrl: string;
      thumbnailUrl: string;
    }>;
  })[];
  displayCount?: number;
}

export default function PatentSources({ sources, displayCount = 10 }: PatentSourcesProps) {

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
                
                {/* Patent Info */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
                  {source.publicationNumber && (
                    <span className="font-medium">{source.publicationNumber}</span>
                  )}
                  {source.inventor && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span><span className="text-blue-500">Inventor:</span> {source.inventor}</span>
                    </>
                  )}
                  {source.assignee && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span><span className="text-blue-500">Assignee:</span> {source.assignee}</span>
                    </>
                  )}
                </div>

                {/* Dates */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
                  {source.priorityDate && (
                    <span><span className="text-blue-500">Priority:</span> {new Date(source.priorityDate).toLocaleDateString()}</span>
                  )}
                  {source.filingDate && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span><span className="text-blue-500">Filed:</span> {new Date(source.filingDate).toLocaleDateString()}</span>
                    </>
                  )}
                  {source.grantDate && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span><span className="text-blue-500">Granted:</span> {new Date(source.grantDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>

                {/* Snippet/Abstract */}
                {source.snippet && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {source.snippet}
                  </p>
                )}

                {/* Patent Figures */}
                {source.figures && source.figures.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {source.figures.slice(0, 5).map((figure, index) => (
                      <a
                        key={figure.imageUrl}
                        href={figure.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-none"
                      >
                        <img
                          src={figure.thumbnailUrl}
                          alt={`Patent figure ${index + 1}`}
                          className="h-16 w-auto rounded border border-gray-200"
                        />
                      </a>
                    ))}
                    {source.figures.length > 5 && (
                      <div className="flex items-center justify-center px-2">
                        <span className="text-xs text-gray-500">+{source.figures.length - 5} more</span>
                      </div>
                    )}
                  </div>
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
