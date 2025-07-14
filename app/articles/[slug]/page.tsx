import type { Metadata } from 'next';
import ArticleContent from '@/components/article-content';
import { notFound } from 'next/navigation';

// Force dynamic rendering for all article pages
export const dynamic = 'force-dynamic';

// Helper function to extract search params and fetch data
async function getArticleDataFromSlug(slug: string) {
  try {
    // Import Supabase client dynamically to avoid build-time evaluation
    const { supabase } = await import('@/lib/supabaseClient');
    
    // First try to get all published articles
    const { data: articles } = await supabase
      .from('search_results')
      .select('*')
      .eq('publishArticle', true);

    if (!articles) return { article: null, searchTerm: '', mode: '' };

    // Find the matching article by comparing generated slugs
    const article = articles.find((article: { searchTerm: string; mode: string }) => {
      const generatedSlug = `${article.searchTerm}-${article.mode}`
        .toLowerCase()
        .replace(/\s+/g, '-');
      return encodeURIComponent(generatedSlug) === slug;
    });

    if (!article) return { article: null, searchTerm: '', mode: '' };

    return { 
      article, 
      searchTerm: article.searchTerm,
      mode: article.mode 
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { article: null, searchTerm: '', mode: '' };
  }
}

// Generate metadata for each article
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { article } = await getArticleDataFromSlug(resolvedParams.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found',
    };
  }

  // Clean up markdown and extract first paragraph for description
  const cleanDescription = article.aiResponse
    .split('\n')
    .map((line: string) => line.replace(/^#+\s+/, '')) // Remove markdown headings
    .find((p: string) => p.trim().length > 0 && !p.startsWith('!'))
    ?.slice(0, 200);
  
  const description = cleanDescription ? `${cleanDescription}...` : article.searchTerm;

  // Get base URL for OG image
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ogImageUrl = `${baseUrl}/api/og/article?title=${encodeURIComponent(article.searchTerm)}`;

  return {
    title: article.searchTerm,
    description,
    openGraph: {
      title: article.searchTerm,
      description,
      type: 'article',
      publishedTime: article.createDate,
      modifiedTime: article.createDate,
      authors: ['rSearch'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.searchTerm,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.searchTerm,
      description,
      images: [ogImageUrl],
    },
  };
}

// Page component
export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const { article } = await getArticleDataFromSlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return <ArticleContent initialData={article} />;
}
