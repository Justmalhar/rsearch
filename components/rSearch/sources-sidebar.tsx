import { SearchResult, PlaceSearchResult } from '@/types/search';

interface SourcesSidebarProps {
  showSidebar: boolean;
  sources: SearchResult[];
  getWebsiteName: (url: string) => string;
}

const isPlaceResult = (source: SearchResult): source is PlaceSearchResult =>
  'address' in source;

export default function SourcesSidebar({ showSidebar, sources, getWebsiteName }: SourcesSidebarProps) {
  const getSourceUrl = (source: SearchResult): string => {
    if (isPlaceResult(source)) {
      return source.website || '';
    }
    return source.link;
  };
  return (
    <div className={`w-1/4 mr-4 shrink-0 transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="sticky top-4 rounded-lg border border-gray-100 bg-white">
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-gray-900">
              Sources
            </h2>
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-50">
              {sources.length}
            </span>
          </div>
        </div>
        
        <div 
          className="overflow-y-auto [scrollbar-width:thin] [scrollbar-color:theme(colors.blue.300)_transparent] hover:[scrollbar-color:theme(colors.blue.500)_transparent]"
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          <div className="divide-y divide-gray-50">
            {sources.map((source, index) => (
              <a
                key={`${getSourceUrl(source)}-${index}`}
                href={getSourceUrl(source)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-gray-50/50 transition-colors"
              >
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <div className="flex-none w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-2 text-sm font-medium text-gray-900 mb-1">
                          {source.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-none">
                            <div className="relative overflow-hidden rounded-full">
                              <div className="absolute inset-0 rounded-full bg-white" />
                              {getSourceUrl(source) ? (
                                <img
                                  src={`https://www.google.com/s2/favicons?sz=128&domain=${new URL(getSourceUrl(source)).hostname}`}
                                  alt=""
                                  width="16"
                                  height="16"
                                  className="relative block w-4 h-4"
                                />
                              ) : (
                                <img
                                  src="/globe.svg"
                                  alt=""
                                  width="16"
                                  height="16"
                                  className="relative block w-4 h-4"
                                />
                              )}
                              <div className="absolute inset-0 rounded-full border border-black/10" />
                            </div>
                          </div>
                          <div className="truncate text-xs font-medium text-gray-500">
                            {getSourceUrl(source) ? getWebsiteName(getSourceUrl(source)) : 'No website available'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {'snippet' in source && source.snippet && (
                      <p className="text-xs text-gray-500 line-clamp-2 pl-9">
                        {source.snippet}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
