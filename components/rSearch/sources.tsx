'use client';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { 
  SearchResult, 
  SearchSource,
  WebSearchResult,
  NewsSearchResult,
  ImageSearchResult,
  VideoSearchResult,
  PlaceSearchResult,
  ShoppingSearchResult,
  AcademicSearchResult,
  SerperResponse
} from '@/types/search';
import WebSources from './sources/sources-web';
import KnowledgeGraph from './sources/sources-knowledge';
import NewsSources from './sources/sources-news';
import ImageSources from './sources/sources-images';
import VideoSources from './sources/sources-videos';
import PlaceSources from './sources/sources-places';
import ShoppingSources from './sources/sources-shopping';
import ScholarSources from './sources/sources-scholar';
import PatentSources from './sources/sources-patents';

interface SourcesProps {
  sources: SearchResult[] | SerperResponse;
  mode: SearchSource;
  isSearchLoading?: boolean;
  error?: string | null;
  getWebsiteName: (url: string) => string;
  setShowSourcesSidebar: (show: boolean) => void;
  knowledgeGraph?: SerperResponse['knowledgeGraph'];
}

export default function Sources({ sources = [], mode, isSearchLoading = false, error = null, getWebsiteName, setShowSourcesSidebar, knowledgeGraph }: SourcesProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [displayCount, setDisplayCount] = useState(2); // Initial display count
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = () => {
    const newState = !showSidebar;
    setShowSidebar(newState);
    setShowSourcesSidebar(newState);
  };

  // Type guard functions
  const isWebResult = (source: SearchResult): source is WebSearchResult => 
    'snippet' in source && !('thumbnail' in source) && !('authors' in source) && !('price' in source) && !('address' in source);
  
  const isNewsResult = (source: SearchResult): source is NewsSearchResult =>
    'snippet' in source && 'title' in source && 'link' in source;
  
  const isImageResult = (source: SearchResult): source is ImageSearchResult =>
    'imageUrl' in source && !('snippet' in source);
  
  const isVideoResult = (source: SearchResult): source is VideoSearchResult =>
    'link' in source && ('imageUrl' in source || 'snippet' in source) && !('price' in source) && !('address' in source);
  
  const isPlaceResult = (source: SearchResult): source is PlaceSearchResult =>
    'address' in source;
  
  const isShoppingResult = (source: SearchResult): source is ShoppingSearchResult =>
    'price' in source;
  
  // Handle sources based on type
  const sourceArray = Array.isArray(sources) ? sources : [];
  const serperResponse = !Array.isArray(sources) ? sources as SerperResponse : null;


  // Filter sources based on type
  const webSources = sourceArray.filter(isWebResult);
  const newsSources = sourceArray.filter(isNewsResult);
  const imageSources = sourceArray.filter(isImageResult);
  const videoSources = serperResponse?.videos || sourceArray.filter(isVideoResult);
  const placeSources = sourceArray.filter(isPlaceResult);
  const shoppingSources = sourceArray.filter(isShoppingResult);

  // Filter and check academic/patent sources
  const scholarSources = sourceArray.filter(source => {
    return 'snippet' in source && ('publicationInfo' in source || 'authors' in source);
  });

  const patentSources = sourceArray.filter(source => {
    return 'snippet' in source && 
      ('publicationNumber' in source || 'inventor' in source || 'priorityDate' in source);
  });

 
  if (isSearchLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skeleton-${Date.now()}-${i}`} className="w-full">
            <div className="group relative flex min-h-[100px] w-full items-stretch">
              <div className="flex w-full rounded-lg bg-gray-50/50">
                <div className="items gap-2 relative flex max-w-full select-none flex-col justify-between p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-none w-5 h-5 rounded-full bg-gray-100 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 bg-gray-100 rounded animate-pulse" />
                      <div className="h-2 bg-gray-100 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sources Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mode === 'web' && knowledgeGraph && (
          <KnowledgeGraph data={knowledgeGraph} />
        )}
        {mode === 'web' && (
          <WebSources sources={webSources.slice(0, displayCount)} displayCount={displayCount} getWebsiteName={getWebsiteName} />
        )}
        {mode === 'news' && (
          <NewsSources sources={newsSources} displayCount={displayCount} />
        )}
        {mode === 'images' && (
          <div className="w-full col-span-2">
            <ImageSources sources={imageSources} displayCount={10} />
          </div>
        )}
        {mode === 'videos' && videoSources.length > 0 && (
          <div className="w-full col-span-2">
            <VideoSources sources={videoSources} displayCount={10} />
          </div>
        )}
        {mode === 'places' && (
          <div className="w-full col-span-2">
            <PlaceSources sources={placeSources} displayCount={10} />
          </div>
        )}
        {mode === 'shopping' && (
          <div className="w-full col-span-2">
            <ShoppingSources sources={shoppingSources} displayCount={10} />
          </div>
        )}
        {mode === 'scholar' && (
          <div className="w-full col-span-2">
            <ScholarSources 
              sources={scholarSources as (AcademicSearchResult & {
                pdfUrl?: string;
                citations?: number;
                publicationInfo?: string;
              })[]} 
              displayCount={displayCount} 
            />
          </div>
        )}
        {mode === 'patents' && (
          <div className="w-full col-span-2">
            <PatentSources 
              sources={patentSources as (AcademicSearchResult & {
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
              })[]} 
              displayCount={displayCount} 
            />
          </div>
        )}

        {/* Show Sources Button */}
        {mode !== 'images' && mode !== 'videos' && mode !== 'places' && mode !== 'shopping' && (
          <div className="flex justify-end w-full col-span-2">
            <button
              type="button"
              onClick={() => isMobile ? setDisplayCount(prev => prev === 2 ? 10 : 2) : toggleSidebar()}
              className="w-full md:w-1/2"
            >
              <div className="flex h-full flex-col justify-between rounded-lg p-3 transition duration-300 bg-gray-50/50 hover:bg-gray-100/50">
                <div className="flex flex-wrap items-center mx-auto gap-2">
                  {sourceArray.slice(displayCount, sourceArray.length).map((source) => (
                    <div key={source.link || (isPlaceResult(source) ? source.cid : undefined) || `source-${Date.now()}-${Math.random()}`} className="flex items-center gap-2 pb-1">
                      <div className="relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 rounded-full bg-background" />
                        <img
                          src={isPlaceResult(source) ? 
                            (source.website ? `https://www.google.com/s2/favicons?sz=128&domain=${new URL(source.website).hostname}` : '/globe.svg') :
                            (source.link ? `https://www.google.com/s2/favicons?sz=128&domain=${new URL(source.link).hostname}` : '/globe.svg')
                          }
                          alt=""
                          width="18" 
                          height="18"
                          className="relative block w-[18px] h-[18px]"
                        />
                        <div className="absolute inset-0 rounded-full border border-black/10" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-medium text-gray-500">
                  {isMobile ? (displayCount === 2 ? 'Show more sources' : 'Show less sources') : (showSidebar ? 'Hide sources' : 'Show all sources')}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
