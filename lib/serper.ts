import 'server-only';
import type { SerperResponse, SearchSource } from '@/types/search';

export class SerperConfigError extends Error {
  status = 500;
  constructor(message = 'Serper API key not configured') {
    super(message);
    this.name = 'SerperConfigError';
  }
}

export class SerperRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'SerperRequestError';
    this.status = status;
  }
}

function serperEndpoint(mode: string): string {
  switch (mode) {
    case 'images':
      return 'https://google.serper.dev/images';
    case 'videos':
      return 'https://google.serper.dev/videos';
    case 'places':
      return 'https://google.serper.dev/places';
    case 'news':
      return 'https://google.serper.dev/news';
    case 'shopping':
      return 'https://google.serper.dev/shopping';
    default:
      return 'https://google.serper.dev/search';
  }
}

function asRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value as Record<string, unknown>[];
  }
  return [];
}

function recordsFrom(data: unknown, key: string): Record<string, unknown>[] {
  if (Array.isArray(data)) return asRecords(data);
  if (data && typeof data === 'object' && key in data) {
    return asRecords((data as Record<string, unknown>)[key]);
  }
  return [];
}

export function formatSerperResponse(
  data: unknown,
  searchQuery: string,
  mode: string
): SerperResponse {
  let formattedData: SerperResponse = {
    searchParameters: {
      q: searchQuery,
      gl: 'us',
      hl: 'en',
    },
  };

  if (mode === 'news') {
    formattedData.news = recordsFrom(data, 'news').map((item, index) => ({
      title: item.title as string,
      link: item.link as string,
      snippet: item.snippet as string,
      imageUrl: item.imageUrl as string | undefined,
      date: item.date as string | undefined,
      source: (item.source as string | undefined) || new URL(item.link as string).hostname,
      position: index + 1,
      attributes: (item.attributes as Record<string, string>) || {},
    }));
  } else if (mode === 'shopping') {
    formattedData.shopping = recordsFrom(data, 'shopping').map((item, index) => ({
      title: item.title as string,
      link: item.link as string,
      source: (item.source as string) || new URL(item.link as string).hostname,
      price: item.price as string,
      delivery: item.delivery as string | undefined,
      imageUrl: item.imageUrl as string | undefined,
      rating: item.rating as number | undefined,
      ratingCount: item.ratingCount as number | undefined,
      offers: item.offers as string | undefined,
      position: index + 1,
    }));
  } else if (mode === 'scholar' || mode === 'patents') {
    formattedData.organic = recordsFrom(data, 'organic').map((item) => {
      if (mode === 'scholar') {
        return {
          title: (item.title as string) || '',
          link: (item.link as string) || '',
          snippet: (item.snippet as string) || '',
          publicationInfo: (item.publicationInfo as string) || '',
          year: item.year || '',
          citedBy: typeof item.citedBy === 'number' ? item.citedBy : undefined,
          pdfUrl: (item.pdfUrl as string) || undefined,
          id: (item.id as string) || `scholar-${Date.now()}-${Math.random()}`,
        };
      }
      return {
        title: (item.title as string) || '',
        link: (item.link as string) || '',
        snippet: (item.snippet as string) || '',
        priorityDate: item.priorityDate as string,
        filingDate: item.filingDate as string,
        grantDate: item.grantDate as string,
        publicationDate: item.publicationDate as string,
        inventor: item.inventor as string,
        assignee: item.assignee as string,
        publicationNumber: item.publicationNumber as string,
        pdfUrl: (item.pdfUrl as string) || undefined,
        figures: (item.figures as Array<{ imageUrl: string; thumbnailUrl: string }>) || undefined,
      };
    }) as SerperResponse['organic'];
  } else if (mode === 'places') {
    formattedData.places = recordsFrom(data, 'places').map((item, index) => ({
      title: item.title as string,
      link: item.link as string,
      position: index + 1,
      address: item.address as string,
      latitude: item.latitude as number,
      longitude: item.longitude as number,
      rating: item.rating as number | undefined,
      ratingCount: item.ratingCount as number | undefined,
      category: item.category as string | undefined,
      phoneNumber: item.phoneNumber as string | undefined,
      website: item.website as string | undefined,
      cid: item.cid as string,
    }));
  } else if (mode === 'videos') {
    formattedData.videos = recordsFrom(data, 'videos').map((item) => ({
      title: item.title as string,
      link: item.link as string,
      imageUrl: item.imageUrl as string | undefined,
      snippet: item.snippet as string | undefined,
      duration: item.duration as string | undefined,
      channel: item.channel as string | undefined,
      views: item.views as string | undefined,
      date: item.date as string | undefined,
      source: (item.source as string) || new URL(item.link as string).hostname,
    }));
  } else if (mode === 'images') {
    formattedData.images = recordsFrom(data, 'images').map((item) => ({
      title: item.title as string,
      link: item.link as string,
      imageUrl: item.imageUrl as string,
      source: (item.source as string) || new URL(item.link as string).hostname,
    }));
  } else if (mode === 'web' || mode === 'search') {
    formattedData = {
      ...formattedData,
      ...(data as unknown as SerperResponse),
    };
  }

  return formattedData;
}

export async function searchWithSerper(
  searchQuery: string,
  mode: SearchSource | string = 'web'
): Promise<SerperResponse> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new SerperConfigError();
  }

  const endpoint = serperEndpoint(mode);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: searchQuery,
      gl: 'us',
      hl: 'en',
      type: mode === 'scholar' ? 'scholar' : mode === 'patents' ? 'patents' : undefined,
      engine: mode === 'scholar' ? 'google_scholar' : mode === 'patents' ? 'google' : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new SerperRequestError(`Serper API error: ${error}`, response.status);
  }

  const data = await response.json();
  return formatSerperResponse(data, searchQuery, mode);
}

export function sourcesFromSerper(searchResults: SerperResponse, mode: SearchSource | string) {
  const organic = searchResults.organic || [];
  const news = searchResults.news || [];
  const images = searchResults.images || [];
  const videos = searchResults.videos || [];
  const shopping = searchResults.shopping || [];
  const places = searchResults.places || [];

  const primary =
    mode === 'news' ? news
      : mode === 'images' ? images
        : mode === 'videos' ? videos
          : mode === 'shopping' ? shopping
            : mode === 'places' ? places
              : organic;

  return {
    results: primary.map((item, index) => ({
      id: index + 1,
      title: 'title' in item ? item.title : '',
      url: 'link' in item ? item.link : '',
      snippet: 'snippet' in item ? item.snippet : undefined,
    })),
    knowledgeGraph: searchResults.knowledgeGraph,
    peopleAlsoAsk: searchResults.peopleAlsoAsk,
    relatedSearches: searchResults.relatedSearches,
  };
}
