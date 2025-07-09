import type { SearchResponse } from '@mendable/firecrawl-js';
import FirecrawlApp from '@mendable/firecrawl-js';
import { generateObject } from 'ai';
import { compact } from 'lodash-es';
import pLimit from 'p-limit';
import { z } from 'zod';
import { o3MiniModel, trimPrompt } from './ai/providers';
import { systemPrompt } from './prompt';

interface FirecrawlConfig {
  apiKey: string;
  baseUrl?: string;
}

interface SearchItem {
  markdown?: string;
  url?: string;
}

interface SerperResult {
  link: string;
  title: string;
  snippet: string;
}

type ResearchResult = {
  learnings: string[];
  visitedUrls: string[];
};

// increase this if you have higher API rate limits
const ConcurrencyLimit = 2;

// Initialize Firecrawl with optional API key and optional base url
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY ?? '',
  baseUrl: process.env.FIRECRAWL_BASE_URL ?? 'https://api.firecrawl.com'
} as FirecrawlConfig);

// take en user query, return a list of SERP queries
async function generateSerpQueries({
  query,
  numQueries = 3,
  learnings,
}: {
  query: string;
  numQueries?: number;
  learnings?: string[];
}) {
  const res = await generateObject({
    model: o3MiniModel,
    system: systemPrompt(),
    prompt: `Given the following prompt from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n${
      learnings
        ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
            '\n',
          )}`
        : ''
    }`,
    schema: z.object({
      queries: z
        .array(
          z.object({
            query: z.string().describe('The SERP query'),
            researchGoal: z
              .string()
              .describe(
                'First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions.',
              ),
          }),
        )
        .describe(`List of SERP queries, max of ${numQueries}`),
    }),
  });

  return res.object.queries.slice(0, numQueries);
}

async function processSerpResult({
  query,
  result,
  numLearnings = 3,
  numFollowUpQuestions = 3,
}: {
  query: string;
  result: SearchResponse;
  numLearnings?: number;
  numFollowUpQuestions?: number;
}) {
  const contents = compact(result.data.map((item: SearchItem) => item.markdown)).map(
    (content: string) => trimPrompt(content, 25_000),
  );

  const res = await generateObject({
    model: o3MiniModel,
    abortSignal: AbortSignal.timeout(60_000),
    system: systemPrompt(),
    prompt: `Given the following contents from a SERP search for the query <query>${query}</query>, generate a list of learnings from the contents. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be concise and to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.\n\n<contents>${contents
      .map(content => `<content>\n${content}\n</content>`)
      .join('\n')}</contents>`,
    schema: z.object({
      learnings: z
        .array(z.string())
        .describe(`List of learnings, max of ${numLearnings}`),
      followUpQuestions: z
        .array(z.string())
        .describe(
          `List of follow-up questions to research the topic further, max of ${numFollowUpQuestions}`,
        ),
    }),
  });

  return res.object;
}

export async function writeFinalReport({
  prompt,
  learnings,
  visitedUrls,
}: {
  prompt: string;
  learnings: string[];
  visitedUrls: string[];
}) {
  const learningsString = trimPrompt(
    learnings
      .map(learning => `<learning>\n${learning}\n</learning>`)
      .join('\n'),
    150_000,
  );

  const res = await generateObject({
    model: o3MiniModel,
    system: systemPrompt(),
    prompt: `Given the following prompt from the user, write a final report on the topic using the learnings from research. Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:\n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learningsString}\n</learnings>`,
    schema: z.object({
      reportMarkdown: z
        .string()
        .describe('Final report on the topic in Markdown'),
    }),
  });

  const urlsSection = `\n\n## Sources\n\n${visitedUrls.map(url => `- ${url}`).join('\n')}`;
  return `${res.object.reportMarkdown}${urlsSection}`;
}

async function performSearch(query: string): Promise<SearchResponse> {
  try {
    const result = await firecrawl.search(query, {
      timeout: 15000,
      limit: 5,
      scrapeOptions: { formats: ['markdown'] },
    });
    return result;
  } catch (error) {
    console.error('Firecrawl search failed:', error);
    
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 5,
      }),
    });

    if (!response.ok) {
      throw new Error('Fallback search failed');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.organic.map((result: SerperResult) => ({
        url: result.link,
        title: result.title,
        markdown: result.snippet,
      })),
    };
  }
}

export async function deepResearch({
  query,
  breadth,
  depth,
  learnings = [],
  visitedUrls = [],
  onProgress,
  onDepthChange,
  onLearningsUpdate,
  onUrlsUpdate,
}: {
  query: string;
  breadth: number;
  depth: number;
  learnings?: string[];
  visitedUrls?: string[];
  onProgress?: (progress: string) => Promise<void>;
  onDepthChange?: (depth: number) => Promise<void>;
  onLearningsUpdate?: (learnings: string[]) => Promise<void>;
  onUrlsUpdate?: (urls: string[]) => Promise<void>;
}): Promise<ResearchResult> {
  const serpQueries = await generateSerpQueries({
    query,
    learnings,
    numQueries: breadth,
  });

  if (onProgress) {
    await onProgress(`Generated ${serpQueries.length} search queries for research...`);
  }

  const limit = pLimit(ConcurrencyLimit);

  const results = await Promise.all(
    serpQueries.map(serpQuery =>
      limit(async () => {
        try {
          if (onProgress) {
            await onProgress(`Researching: ${serpQuery.query}`);
          }

          const result = await performSearch(serpQuery.query);

          const newUrls = compact(result.data.map((item: SearchItem) => item.url));
          const newBreadth = Math.ceil(breadth / 2);
          const newDepth = depth - 1;

          if (onProgress) {
            await onProgress(`Processing results from ${serpQuery.query}...`);
          }

          const newLearnings = await processSerpResult({
            query: serpQuery.query,
            result,
            numFollowUpQuestions: newBreadth,
          });

          const allLearnings = [...learnings, ...newLearnings.learnings];
          const allUrls = [...visitedUrls, ...newUrls];

          // Notify about new learnings and URLs
          if (onLearningsUpdate && newLearnings.learnings.length > 0) {
            await onLearningsUpdate(newLearnings.learnings);
          }
          
          if (onUrlsUpdate && newUrls.length > 0) {
            await onUrlsUpdate(newUrls);
          }

          if (newDepth > 0) {
            if (onProgress) {
              await onProgress('Going deeper into research...');
            }
            if (onDepthChange) {
              await onDepthChange(newDepth);
            }

            const nextQuery = [
              `Previous research goal: ${serpQuery.researchGoal}`,
              `Follow-up research directions: ${newLearnings.followUpQuestions.map(q => `\n${q}`).join('')}`
            ].join('\n').trim();

            return deepResearch({
              query: nextQuery,
              breadth: newBreadth,
              depth: newDepth,
              learnings: allLearnings,
              visitedUrls: allUrls,
              onProgress,
              onDepthChange,
              onLearningsUpdate,
              onUrlsUpdate,
            });
          }
          
          return {
            learnings: allLearnings,
            visitedUrls: allUrls,
          };
        } catch (e) {
          console.error(`Error running query: ${serpQuery.query}: `, e);
          return {
            learnings: [],
            visitedUrls: [],
          };
        }
      }),
    ),
  );

  return {
    learnings: [...new Set(results.flatMap(r => r.learnings))],
    visitedUrls: [...new Set(results.flatMap(r => r.visitedUrls))],
  };
}
