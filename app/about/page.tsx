import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, Brain, Zap, Globe, Shield, Users, Code, BookText, Video, Newspaper, GraduationCap, Lightbulb, MapPin, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "About rSearch - AI-Powered Reasoning Engine | Free Perplexity Alternative",
  description: "Learn about rSearch, the advanced AI-powered reasoning engine that combines cutting-edge AI models with comprehensive internet search. Free alternative to Perplexity with intelligent reasoning capabilities.",
  keywords: [
    "about rsearch", "rsearch features", "AI reasoning engine", "advanced AI models", 
    "Perplexity alternative", "AI search engine", "free AI search", "reasoning AI",
    "chain of thought reasoning", "AI research assistant", "intelligent search",
    "web search", "image search", "video search", "news search", "academic search",
    "patent search", "shopping search", "places search", "multi-source search"
  ],
  openGraph: {
    title: "About rSearch - AI-Powered Reasoning Engine",
    description: "Learn about rSearch, the advanced AI-powered reasoning engine that combines cutting-edge AI models with comprehensive internet search.",
    url: 'https://rsearch.app/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            About rSearch
          </h1>
          <p className="text-xl text-orange-700 leading-relaxed">
            The most advanced AI-powered reasoning engine that combines cutting-edge language models 
            with comprehensive internet search functionality.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-orange-900 mb-4 font-instrument-serif">
              Our Mission
            </h2>
            <p className="text-orange-700 leading-relaxed text-lg">
              rSearch was created to democratize access to advanced AI reasoning capabilities. 
              We believe that intelligent search should be available to everyone, not just those 
              who can afford expensive subscriptions. By combining the power of advanced AI reasoning 
              with comprehensive internet search, we provide a free alternative to 
              expensive AI search engines like Perplexity.
            </p>
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-900 mb-6 font-instrument-serif">
            Powered by Advanced AI Technology
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200/50">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-orange-600" />
                <h3 className="text-xl font-semibold text-orange-800">
                  Advanced AI Reasoning
                </h3>
              </div>
              <p className="text-orange-700 leading-relaxed">
                At the core of rSearch are state-of-the-art AI reasoning models that can think through 
                complex problems step-by-step. These advanced AI models enable rSearch to provide 
                intelligent, well-reasoned responses rather than just listing search results.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200/50">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-8 w-8 text-orange-600" />
                <h3 className="text-xl font-semibold text-orange-800">
                  Comprehensive Search
                </h3>
              </div>
              <p className="text-orange-700 leading-relaxed">
                rSearch doesn&apos;t just search the web - it searches across multiple content types 
                including images, videos, news, academic papers, patents, shopping, and places. 
                This multi-source approach ensures you get the most comprehensive and relevant results.
              </p>
            </div>
          </div>
        </section>

        {/* Search Modes Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-900 mb-6 font-instrument-serif">
            Comprehensive Search Modes
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Web Search</h3>
              <p className="text-xs text-orange-700">
                Search across the entire internet for comprehensive results
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <BookText className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Image Search</h3>
              <p className="text-xs text-orange-700">
                Find images and visual content from across the web
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Video className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Video Search</h3>
              <p className="text-xs text-orange-700">
                Discover and watch videos from multiple platforms
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Newspaper className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">News Search</h3>
              <p className="text-xs text-orange-700">
                Latest news and updates from reliable sources
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Places Search</h3>
              <p className="text-xs text-orange-700">
                Find locations, businesses, and points of interest
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Shopping Search</h3>
              <p className="text-xs text-orange-700">
                Search for products, deals, and shopping options
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Scholar Search</h3>
              <p className="text-xs text-orange-700">
                Search academic papers and research publications
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-200/50">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Lightbulb className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-1 text-sm">Patent Search</h3>
              <p className="text-xs text-orange-700">
                Search patent databases and intellectual property
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-orange-900 mb-6 font-instrument-serif">
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">AI-Powered Reasoning</h3>
              <p className="text-sm text-orange-700">
                Advanced chain-of-thought reasoning for complex problem solving and analysis
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Multi-Source Search</h3>
              <p className="text-sm text-orange-700">
                Search across web, images, videos, news, scholar, patents, shopping & places
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Privacy Focused</h3>
              <p className="text-sm text-orange-700">
                Your searches are private and not stored for advertising purposes
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Free & Open</h3>
              <p className="text-sm text-orange-700">
                Completely free to use with no usage limits or subscription fees
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Customizable Models</h3>
              <p className="text-sm text-orange-700">
                Choose from multiple AI providers for your preferred reasoning model
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Intelligent Insights</h3>
              <p className="text-sm text-orange-700">
                Get thoughtful analysis and insights, not just search results
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 border border-orange-200/50">
            <h2 className="text-2xl font-bold text-orange-900 mb-6 text-center font-instrument-serif">
              Why Choose rSearch Over Perplexity?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  💰 Completely Free
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  While Perplexity requires a paid subscription for advanced features, 
                  rSearch offers the same powerful AI reasoning capabilities completely free. 
                  No usage limits, no hidden fees, no credit card required.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🔧 More Customizable
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  rSearch allows you to choose your preferred AI provider from multiple options. 
                  This flexibility gives you control over which AI models power your searches.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🚀 Advanced Reasoning
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Powered by advanced AI reasoning models, rSearch provides superior reasoning capabilities 
                  that can think through complex problems step-by-step, delivering insights 
                  rather than just results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🔍 Multi-Source Search
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Search across 8 different content types including images, videos, news, 
                  academic papers, patents, shopping, and places - all in one powerful interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-orange-900 mb-4 font-instrument-serif">
              Ready to Experience Advanced AI Reasoning?
            </h2>
            <p className="text-orange-700 mb-6">
              Start using rSearch today and discover the power of AI-powered reasoning combined with comprehensive search.
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