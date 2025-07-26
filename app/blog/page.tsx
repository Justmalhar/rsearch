import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Search } from "lucide-react";

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
  const blogPosts = [
    {
      id: "ai-reasoning-search-engines",
      title: "The Future of AI-Powered Search Engines: Beyond Traditional Results",
      excerpt: "Discover how AI reasoning is revolutionizing search engines, moving beyond simple result lists to intelligent analysis and insights.",
      author: "Malhar Ujawane",
      date: "2024-02-05",
      readTime: "5 min read",
      category: "AI Technology",
      keywords: ["AI search engines", "reasoning search", "future of search", "intelligent search"]
    },
    {
      id: "deepseek-r1-reasoning",
      title: "DeepSeek R1: The Revolutionary Reasoning Model Powering Next-Gen AI Search",
      excerpt: "Explore how DeepSeek R1's advanced reasoning capabilities are transforming AI search engines and enabling more intelligent responses.",
      author: "Malhar Ujawane",
      date: "2024-02-04",
      readTime: "7 min read",
      category: "AI Models",
      keywords: ["DeepSeek R1", "AI reasoning", "reasoning model", "AI search technology"]
    },
    {
      id: "perplexity-alternatives",
      title: "Top Free Alternatives to Perplexity: AI Search Engines That Don't Cost a Fortune",
      excerpt: "Discover powerful free alternatives to Perplexity that offer similar AI reasoning capabilities without the high subscription costs.",
      author: "Malhar Ujawane",
      date: "2024-02-03",
      readTime: "6 min read",
      category: "AI Tools",
      keywords: ["Perplexity alternatives", "free AI search", "AI search engines", "cost-effective AI"]
    },
    {
      id: "chain-of-thought-reasoning",
      title: "Chain-of-Thought Reasoning: How AI is Learning to Think Like Humans",
      excerpt: "Learn about chain-of-thought reasoning and how it's enabling AI systems to solve complex problems step-by-step, just like humans do.",
      author: "Malhar Ujawane",
      date: "2024-02-02",
      readTime: "8 min read",
      category: "AI Research",
      keywords: ["chain of thought", "AI reasoning", "problem solving", "cognitive AI"]
    },
    {
      id: "multi-source-search",
      title: "Multi-Source Search: The Power of Searching Across Different Content Types",
      excerpt: "Explore how multi-source search capabilities are enhancing AI search engines by combining web, images, videos, news, and more.",
      author: "Malhar Ujawane",
      date: "2024-02-01",
      readTime: "4 min read",
      category: "Search Technology",
      keywords: ["multi-source search", "search capabilities", "content search", "AI search features"]
    },
    {
      id: "ai-search-vs-traditional",
      title: "AI Search vs Traditional Search: Understanding the Key Differences",
      excerpt: "Compare AI-powered search engines with traditional search engines and understand how AI reasoning is changing the search experience.",
      author: "Malhar Ujawane",
      date: "2024-01-31",
      readTime: "6 min read",
      category: "Comparison",
      keywords: ["AI search vs traditional", "search comparison", "AI reasoning", "search evolution"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
          
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            rSearch Blog
          </h1>
          <p className="text-xl text-blue-700 leading-relaxed">
            Insights, tutorials, and deep dives into AI-powered search engines, 
            reasoning technology, and the future of intelligent search.
          </p>
        </div>

        {/* Featured Post */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-200/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
              <span className="text-blue-600 text-sm">
                {blogPosts[0].category}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              {blogPosts[0].title}
            </h2>
            
            <p className="text-blue-700 leading-relaxed mb-6">
              {blogPosts[0].excerpt}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-blue-600 mb-6">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {blogPosts[0].author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(blogPosts[0].date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blogPosts[0].readTime}
              </div>
            </div>
            
            <Link 
              href={`/blog/${blogPosts[0].id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              Read Full Article
            </Link>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-8">
            Latest Articles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-xl p-6 shadow-lg border border-blue-200/50 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-blue-800 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-blue-700 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-blue-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString()}
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
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                
                <Link 
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
                >
                  Read More
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            Browse by Category
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["AI Technology", "AI Models", "AI Tools", "AI Research", "Search Technology", "Comparison"].map((category) => (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-xl p-4 shadow-md border border-blue-200/50 hover:shadow-lg transition-shadow text-center"
              >
                <h3 className="font-semibold text-blue-800">{category}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-200/50">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Experience AI-Powered Search Today
            </h2>
            <p className="text-blue-700 mb-6">
              Ready to try the advanced reasoning capabilities you&apos;ve been reading about? 
              Start using rSearch and discover the power of AI-powered search.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
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