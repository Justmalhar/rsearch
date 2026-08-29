import type {
  SerperResponse,
  WebSearchResult,
  ImageSearchResult,
  VideoSearchResult,
  NewsSearchResult,
  ShoppingSearchResult,
} from '@/types/search';

export function buildSearchContext(
  searchTerm: string,
  searchResults: SerperResponse,
  mode: string,
  refinedQuery?: { query: string; explanation: string }
): string {
  let context = '';

  if (searchResults.knowledgeGraph) {
    const kg = searchResults.knowledgeGraph;
    context += `### Knowledge Graph\nTitle: ${kg.title}\nType: ${kg.type}${kg.description ? `\nDescription: ${kg.description}` : ''}\n`;
    if (kg.attributes) {
      context += 'Attributes:\n';
      for (const [key, value] of Object.entries(kg.attributes)) {
        context += `- ${key}: ${value}\n`;
      }
    }
    if (kg.images?.length) {
      context += 'Images:\n';
      for (const image of kg.images) {
        context += `- ${image.title || 'Image'}: ${image.imageUrl}\n`;
      }
    }
    context += '\n';
  }

  if (searchResults.organic?.length) {
    context += '### Organic Results\n';
    context += searchResults.organic.map((result: WebSearchResult, index: number) => {
      return `[${index + 1}] ${result.title}
Source: ${result.link}
${result.snippet}
${result.date ? `Date: ${result.date}\n` : ''}${result.attributes ? `Attributes:
${Object.entries(result.attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n` : ''}${result.imageUrl ? `Image: ${result.imageUrl}\n` : ''}${result.thumbnailUrl ? `Thumbnail: ${result.thumbnailUrl}\n` : ''}\n`;
    }).join('');
  }

  if (searchResults.news?.length) {
    context += '### Top Stories\n';
    context += searchResults.news.map((story: NewsSearchResult, index: number) => {
      return `[${index + 1}] ${story.title}
Source: ${story.source}
Link: ${story.link}
${story.date ? `Date: ${story.date}\n` : ''}${story.imageUrl ? `Image: ${story.imageUrl}\n` : ''}${story.snippet ? `Summary: ${story.snippet}\n` : ''}\n`;
    }).join('');
  }

  if (searchResults.peopleAlsoAsk?.length) {
    context += '### People Also Ask\n';
    context += searchResults.peopleAlsoAsk.map((item: { question: string; snippet: string; link: string; title?: string }, index: number) => {
      return `[${index + 1}] Q: ${item.question}
A: ${item.snippet}
Source: ${item.link}
${item.title ? `Title: ${item.title}\n` : ''}\n`;
    }).join('');
  }

  if (searchResults.relatedSearches?.length) {
    context += '### Related Searches\n';
    context += searchResults.relatedSearches.map((item: { query: string }, index: number) =>
      `[${index + 1}] ${item.query}\n`
    ).join('');
    context += '\n';
  }

  if (searchResults.images?.length) {
    context += '### Images\n';
    context += searchResults.images.map((image: ImageSearchResult, index: number) => {
      return `[${index + 1}] ${image.title || 'Image'}
URL: ${image.imageUrl}
${image.source ? `Source: ${image.source}\n` : ''}\n`;
    }).join('');
  }

  if (searchResults.shopping?.length) {
    context += '### Shopping Results\n';
    context += searchResults.shopping.map((item: ShoppingSearchResult, index: number) => {
      return `[${index + 1}] ${item.title}
Price: ${item.price || 'N/A'}
${item.rating ? `Rating: ${item.rating}\n` : ''}${item.source ? `Source: ${item.source}\n` : ''}${item.link ? `Link: ${item.link}\n` : ''}${item.imageUrl ? `Image: ${item.imageUrl}\n` : ''}\n`;
    }).join('');
  }

  if (searchResults.videos?.length) {
    context += '### Videos\n';
    context += searchResults.videos.map((video: VideoSearchResult, index: number) => {
      return `[${index + 1}] ${video.title}
Link: ${video.link}
${video.date ? `Date: ${video.date}\n` : ''}${video.duration ? `Duration: ${video.duration}\n` : ''}${video.imageUrl ? `Image: ${video.imageUrl}\n` : ''}\n`;
    }).join('');
  }

  let searchContext = '';
  if (refinedQuery) {
    searchContext += `### Search Context\nOriginal Query: ${searchTerm}\nRefined Query: ${refinedQuery.query}\nRefinement Explanation: ${refinedQuery.explanation}\nSearch Mode: ${mode}\n\n`;
  } else {
    searchContext += `### Search Context\nQuery: ${searchTerm}\nSearch Mode: ${mode}\n\n`;
  }

  return searchContext + context;
}
