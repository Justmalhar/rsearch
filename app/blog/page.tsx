import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Search } from "lucide-react";
import { getAllBlogPosts, getAllCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "rSearch Blog - AI Search, Reasoning Engine & Technology Insights",
  description: "Explore insights about AI-powered search engines, reasoning technology, DeepSeek R1, and the future of intelligent search. Learn about rSearch and AI search alternatives.",
  keywords: [
    "AI search blog", "reasoning engine blog", "DeepSeek R1 blog", "AI technology blog",
    "search engine blog", "Perplexity alternative blog", "AI reasoning blog", "search technology",
    "artificial intelligence blog", "AI search insights", "reasoning AI blog"
  ],
  openGraph: {
    title: "rSearch Blog - AI Search & Technology Insights",
    description: "Explore insights about AI-powered search engines, reasoning technology, and the future of intelligent search.",
    url: 'https://rsearch.app/blog',
  },
};

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();
  const categories = getAllCategories();

  // If no posts found, show empty state
  if (blogPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Link>
            
            <h1 className="text-4xl font-bold text-orange-900 mb-4">
              rSearch Blog
            </h1>
            <p className="text-xl text-orange-700 leading-relaxed">
              Insights, tutorials, and deep dives into AI-powered search engines, 
              reasoning technology, and the future of intelligent search.
            </p>
          </div>

          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">
              No Blog Posts Found
            </h2>
            <p className="text-orange-700 mb-6">
              Blog posts will appear here once they are added to the posts folder.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              <Search className="h-5 w-5" />
              Start Searching with AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
          
          <h1 className="text-4xl font-bold text-orange-900 mb-4">
            rSearch Blog
          </h1>
          <p className="text-xl text-orange-700 leading-relaxed">
            Insights, tutorials, and deep dives into AI-powered search engines, 
            reasoning technology, and the future of intelligent search.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-orange-200/50">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-orange-100 text-orange-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                  Featured
                </span>
                <span className="text-orange-600 text-xs md:text-sm">
                  {blogPosts[0].category}
                </span>
              </div>
              
              <h2 className="text-lg md:text-2xl font-bold text-orange-900 mb-3 md:mb-4">
                {blogPosts[0].title}
              </h2>
              
              <p className="text-sm md:text-base text-orange-700 leading-relaxed mb-4 md:mb-6">
                {blogPosts[0].description}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-orange-600 mb-4 md:mb-6">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 md:h-4 md:w-4" />
                  {blogPosts[0].author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  {new Date(blogPosts[0].publishDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  {blogPosts[0].readTime}
                </div>
              </div>
              
              <Link 
                href={`/blog/${blogPosts[0].slug}`}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm md:text-base"
              >
                Read Full Article
              </Link>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        {blogPosts.length > 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-orange-900 mb-8">
              Latest Articles
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <article key={post.slug} className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-orange-800 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-orange-700 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-orange-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.keywords.slice(0, 3).map((keyword, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium text-sm"
                  >
                    Read More
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-orange-900 mb-6">
              Browse by Category
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white rounded-xl p-4 shadow-md border border-orange-200/50 hover:shadow-lg transition-shadow text-center"
                >
                  <h3 className="font-semibold text-orange-800">{category}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 border border-orange-200/50">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">
              Experience AI-Powered Search Today
            </h2>
            <p className="text-orange-700 mb-6">
              Ready to try the advanced reasoning capabilities you&apos;ve been reading about? 
              Start using rSearch and discover the power of AI-powered search.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              <Search className="h-5 w-5" />
              Start Searching with AI
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}