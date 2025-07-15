import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, Brain, Zap, Globe, Shield, Users, Image, Video, Newspaper, GraduationCap, Lightbulb, MapPin, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "rSearch Features - AI-Powered Search & Reasoning Capabilities",
  description: "Explore rSearch's advanced features including AI reasoning, multi-source search, image generation, and customizable AI models. Free alternative to Perplexity with comprehensive search capabilities.",
  keywords: [
    "rsearch features", "AI search features", "reasoning engine features", "multi-source search",
    "AI image search", "AI video search", "AI news search", "AI scholar search", "AI patent search",
    "AI shopping search", "AI places search", "DeepSeek R1 features", "Perplexity alternative features",
    "free AI search features", "AI reasoning capabilities", "chain of thought search"
  ],
  openGraph: {
    title: "rSearch Features - AI-Powered Search & Reasoning",
    description: "Explore rSearch's advanced features including AI reasoning, multi-source search, and customizable AI models.",
    url: 'https://rsearch.app/features',
  },
};

export default function FeaturesPage() {
  const searchFeatures = [
    {
      icon: Globe,
      title: "Web Search",
      description: "Comprehensive web search with AI-powered reasoning and analysis",
      keywords: ["web search", "internet search", "AI web search"]
    },
    {
      icon: Image,
      title: "Image Search",
      description: "Find and analyze images with intelligent AI reasoning",
      keywords: ["image search", "AI image search", "visual search"]
    },
    {
      icon: Video,
      title: "Video Search",
      description: "Discover and analyze video content across the web",
      keywords: ["video search", "AI video search", "video discovery"]
    },
    {
      icon: Newspaper,
      title: "News Search",
      description: "Latest news and current events with AI analysis",
      keywords: ["news search", "AI news search", "current events"]
    },
    {
      icon: GraduationCap,
      title: "Scholar Search",
      description: "Academic papers and research with intelligent insights",
      keywords: ["scholar search", "academic search", "research papers"]
    },
    {
      icon: Lightbulb,
      title: "Patent Search",
      description: "Search patent databases with AI-powered analysis",
      keywords: ["patent search", "AI patent search", "intellectual property"]
    },
    {
      icon: ShoppingBag,
      title: "Shopping Search",
      description: "Product information and price comparisons",
      keywords: ["shopping search", "product search", "price comparison"]
    },
    {
      icon: MapPin,
      title: "Places Search",
      description: "Location-based information and business search",
      keywords: ["places search", "location search", "business search"]
    }
  ];

  const aiFeatures = [
    {
      icon: Brain,
      title: "DeepSeek R1 Reasoning",
      description: "Advanced chain-of-thought reasoning for complex problem solving",
      keywords: ["DeepSeek R1", "AI reasoning", "chain of thought"]
    },
    {
      icon: Zap,
      title: "Multi-Model Support",
      description: "Choose from OpenAI, OpenRouter, or DeepSeek AI models",
      keywords: ["OpenAI", "OpenRouter", "DeepSeek", "AI models"]
    },
    {
      icon: Shield,
      title: "Privacy Focused",
      description: "Your searches are private and not stored for advertising",
      keywords: ["privacy", "private search", "secure search"]
    },
    {
      icon: Users,
      title: "Free & Unlimited",
      description: "No usage limits, no subscription fees, completely free",
      keywords: ["free AI search", "unlimited search", "no subscription"]
    }
  ];

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
            rSearch Features
          </h1>
          <p className="text-xl text-orange-700 leading-relaxed">
            Discover the comprehensive features that make rSearch the most advanced 
            AI-powered reasoning engine available today.
          </p>
        </div>

        {/* AI Reasoning Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-orange-900 mb-4">
                AI-Powered Reasoning Engine
              </h2>
              <p className="text-lg text-orange-700 max-w-3xl mx-auto">
                rSearch combines the power of DeepSeek R1 reasoning with comprehensive internet search 
                to provide intelligent, well-reasoned responses to complex queries.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-orange-800 mb-3">
                  🤖 Advanced Chain-of-Thought Reasoning
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Unlike traditional search engines that just list results, rSearch thinks through 
                  problems step-by-step using advanced AI reasoning. This enables it to provide 
                  intelligent insights and analysis rather than just search results.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-orange-800 mb-3">
                  🧠 DeepSeek R1 Technology
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Powered by the state-of-the-art DeepSeek R1 model, rSearch delivers superior 
                  reasoning capabilities that can handle complex queries, mathematical problems, 
                  and analytical tasks with exceptional accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Types Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-orange-900 mb-8 text-center">
            Multi-Source Search Capabilities
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-orange-700 mb-3">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {feature.keywords.map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Features Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-orange-900 mb-8 text-center">
            Advanced AI Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-orange-800">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-orange-700 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feature.keywords.map((keyword, idx) => (
                    <span 
                      key={idx}
                      className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 border border-orange-200/50">
            <h2 className="text-3xl font-bold text-orange-900 mb-8 text-center">
              rSearch vs Other AI Search Engines
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-orange-200">
                    <th className="py-4 px-4 font-semibold text-orange-800">Feature</th>
                    <th className="py-4 px-4 font-semibold text-orange-800">rSearch</th>
                    <th className="py-4 px-4 font-semibold text-orange-800">Perplexity</th>
                    <th className="py-4 px-4 font-semibold text-orange-800">Google</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-orange-100">
                    <td className="py-3 px-4 font-medium text-orange-800">AI Reasoning</td>
                    <td className="py-3 px-4 text-green-600">✅ DeepSeek R1</td>
                    <td className="py-3 px-4 text-green-600">✅ GPT-4</td>
                    <td className="py-3 px-4 text-red-600">❌ Limited</td>
                  </tr>
                  <tr className="border-b border-orange-100">
                    <td className="py-3 px-4 font-medium text-orange-800">Multi-Source Search</td>
                    <td className="py-3 px-4 text-green-600">✅ 8 Sources</td>
                    <td className="py-3 px-4 text-green-600">✅ Multiple</td>
                    <td className="py-3 px-4 text-green-600">✅ Multiple</td>
                  </tr>
                  <tr className="border-b border-orange-100">
                    <td className="py-3 px-4 font-medium text-orange-800">Free Usage</td>
                    <td className="py-3 px-4 text-green-600">✅ Unlimited</td>
                    <td className="py-3 px-4 text-red-600">❌ Limited</td>
                    <td className="py-3 px-4 text-green-600">✅ Free</td>
                  </tr>
                  <tr className="border-b border-orange-100">
                    <td className="py-3 px-4 font-medium text-orange-800">Customizable AI</td>
                    <td className="py-3 px-4 text-green-600">✅ 3 Providers</td>
                    <td className="py-3 px-4 text-red-600">❌ Fixed</td>
                    <td className="py-3 px-4 text-red-600">❌ Fixed</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-orange-800">Privacy Focused</td>
                    <td className="py-3 px-4 text-green-600">✅ Yes</td>
                    <td className="py-3 px-4 text-yellow-600">⚠️ Limited</td>
                    <td className="py-3 px-4 text-red-600">❌ No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-3xl font-bold text-orange-900 mb-4">
              Experience Advanced AI Search Today
            </h2>
            <p className="text-orange-700 mb-6 text-lg">
              Start using rSearch and discover the power of AI-powered reasoning combined with comprehensive search capabilities.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-lg"
            >
              <Search className="h-6 w-6" />
              Start Searching with AI
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}