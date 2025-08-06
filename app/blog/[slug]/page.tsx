import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} - rSearch Blog`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: post.keywords,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Back Button */}
        <div className="mb-6 md:mb-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-orange-200/50 mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-900 mb-3 md:mb-4">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-orange-700 leading-relaxed mb-4 md:mb-6">
            {post.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-orange-600 mb-4 md:mb-6">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 md:h-4 md:w-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
              {new Date(post.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              {post.readTime}
            </div>
          </div>

          {/* Keywords */}
          {post.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
              {post.keywords.map((keyword, idx) => (
                                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-1 md:px-2 py-1 rounded-full"
                  >
                    <Tag className="h-2 w-2 md:h-3 md:w-3" />
                    {keyword}
                  </span>
              ))}
            </div>
          )}
        </article>

        {/* Article Content */}
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-orange-200/50">
          <div className="prose prose-orange max-w-none">
            <Markdown
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
                p: ({children, ...props}) => {
                  // Get text content from React children
                  const content = Array.isArray(children) 
                    ? children
                        .map(child => {
                          if (typeof child === 'string') return child;
                          if (child && typeof child === 'object' && 'props' in child) {
                            return child.props.children || '';
                          }
                          return '';
                        })
                        .join('')
                    : children?.toString() || '';
                  
                  // Check if content looks like a table
                  if (content.includes('|')) {
                    const lines = content.split('\n').filter(line => line.trim());
                    
                    // Only process as table if we have header and separator rows
                    if (lines.length >= 2 && lines[1].includes('-')) {
                      // Parse table rows, excluding separator row
                      const tableRows = lines
                        .filter(line => !line.includes('---'))
                        .map(line => {
                          // Split by | and clean each cell
                          const cells = line.split('|')
                            .map(cell => cell.trim())
                            .filter(cell => cell);
                          
                          // Return null if no valid cells (helps filter empty rows)
                          return cells.length > 0 ? cells : null;
                        })
                        .filter((row): row is string[] => row !== null);

                      if (tableRows.length > 0) {
                        return (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                              <thead className="bg-orange-50">
                                <tr>
                                  {tableRows[0].map((header) => (
                                    <th key={`header-${header}`} className="px-6 py-3 text-left text-sm font-semibold text-orange-600">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {tableRows.slice(1).map((row) => (
                                  <tr key={`row-${row.join('-')}`} className="hover:bg-orange-50/50 transition-colors">
                                    {row.map((cell) => (
                                      <td key={`cell-${cell}`} className="px-6 py-4 text-sm text-gray-700 whitespace-normal">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                    }
                  }
                  
                  return (
                    <p {...props} className="text-orange-800 leading-relaxed mb-4" />
                  );
                },
                ul: ({...props}) => (
                  <ul {...props} className="list-disc list-inside text-orange-800 mb-4 space-y-1" />
                ),
                ol: ({...props}) => (
                  <ol {...props} className="list-decimal list-inside text-orange-800 mb-4 space-y-1" />
                ),
                li: ({...props}) => (
                  <li {...props} className="text-orange-800" />
                ),
                blockquote: ({...props}) => (
                  <blockquote {...props} className="border-l-4 border-orange-300 pl-4 italic text-orange-700 mb-4" />
                ),
                code: ({...props}) => (
                  <code {...props} className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded text-sm font-mono" />
                ),
                pre: ({...props}) => (
                  <pre {...props} className="bg-orange-50 border border-orange-200 rounded-lg p-4 overflow-x-auto mb-4" />
                ),
                a: ({href, ...props}) => (
                  <a 
                    href={href} 
                    {...props} 
                    className="text-orange-600 hover:text-orange-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                strong: ({...props}) => (
                  <strong {...props} className="font-semibold text-orange-900" />
                ),
                em: ({...props}) => (
                  <em {...props} className="italic text-orange-800" />
                ),
                table: ({...props}) => (
                  <div className="overflow-x-auto mb-4">
                    <table {...props} className="min-w-full divide-y divide-gray-200 border border-gray-200" />
                  </div>
                ),
                thead: ({...props}) => (
                  <thead {...props} className="bg-orange-50" />
                ),
                tbody: ({...props}) => (
                  <tbody {...props} className="bg-white divide-y divide-gray-200" />
                ),
                tr: ({...props}) => (
                  <tr {...props} className="hover:bg-orange-50/50 transition-colors" />
                ),
                th: ({...props}) => (
                  <th {...props} className="px-6 py-3 text-left text-sm font-semibold text-orange-600" />
                ),
                td: ({...props}) => (
                  <td {...props} className="px-6 py-4 text-sm text-gray-700 whitespace-normal" />
                ),
                hr: ({...props}) => (
                  <hr {...props} className="border-orange-200 my-8" />
                ),
              }}
            >
              {post.content}
            </Markdown>
          </div>
        </div>

        {/* Related Posts Section */}
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-orange-900 mb-4 md:mb-6">
            More from rSearch Blog
          </h2>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {/* You can add related posts logic here */}
            <Link 
              href="/blog" 
              className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-200/50 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-base md:text-lg font-semibold text-orange-800 mb-2">
                Explore All Articles
              </h3>
              <p className="text-orange-700 text-xs md:text-sm">
                Discover more insights about AI-powered search and reasoning technology.
              </p>
            </Link>
            <Link 
              href="/" 
              className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-orange-200/50 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-base md:text-lg font-semibold text-orange-800 mb-2">
                Try rSearch
              </h3>
              <p className="text-orange-700 text-xs md:text-sm">
                Experience the advanced reasoning capabilities you just read about.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}