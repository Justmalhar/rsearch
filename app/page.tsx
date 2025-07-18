"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Search, Globe, BookText, Video, 
  Zap, ShoppingBag, MapPin, 
  Newspaper, GraduationCap, Lightbulb, Sparkles, Brain
} from "lucide-react";
import { SearchSource } from "@/types/search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Meteors } from "@/components/ui/meteors";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const [searchMode, setSearchMode] = useState<SearchSource | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [enableQueryRefinement, setEnableQueryRefinement] = useState(true);
  const [enableDeepResearch, setEnableDeepResearch] = useState(false);

  // Initialize default settings if they don't exist
  useEffect(() => {
    const savedSettings = localStorage.getItem("rSearch_settings");
    if (!savedSettings) {
      const defaultSettings = {
        aiProvider: "deepseek",
        searchProvider: "serper",
        autoExpandSections: true,
        enableQueryRefinement: true
      };
      localStorage.setItem("rSearch_settings", JSON.stringify(defaultSettings));
    } else {
      const settings = JSON.parse(savedSettings);
      setEnableQueryRefinement(settings.enableQueryRefinement ?? true);
    }
  }, []);

  // Update settings when toggle changes - removed since button is hidden
  // const handleQueryRefinementToggle = () => {
  //   const newValue = !enableQueryRefinement;
  //   setEnableQueryRefinement(newValue);
  //   const savedSettings = localStorage.getItem("rSearch_settings");
  //   if (savedSettings) {
  //     const settings = JSON.parse(savedSettings);
  //     settings.enableQueryRefinement = newValue;
  //     localStorage.setItem("rSearch_settings", JSON.stringify(settings));
  //   }
  // };

  const searchModes = [
    {
      id: 'search' as SearchSource,
      icon: Globe,
      label: 'Web',
      description: 'Search across the entire internet'
    },
    {
      id: 'images' as SearchSource,
      icon: BookText,
      label: 'Images',
      description: 'Find images and visual content'
    },
    {
      id: 'videos' as SearchSource,
      icon: Video,
      label: 'Videos',
      description: 'Discover and watch videos'
    },
    {
      id: 'news' as SearchSource,
      icon: Newspaper,
      label: 'News',
      description: 'Latest news and updates'
    },
    {
      id: 'places' as SearchSource,
      icon: MapPin,
      label: 'Places',
      description: 'Find locations and businesses'
    },
    {
      id: 'shopping' as SearchSource,
      icon: ShoppingBag,
      label: 'Shopping',
      description: 'Search for products and deals'
    },
    {
      id: 'scholar' as SearchSource,
      icon: GraduationCap,
      label: 'Scholar',
      description: 'Search academic papers and research'
    },
    {
      id: 'patents' as SearchSource,
      icon: Lightbulb,
      label: 'Patents',
      description: 'Search patent databases'
    }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    if (enableDeepResearch) {
      router.push(`/deep-research/?query=${encodeURIComponent(searchTerm)}&mode=${searchMode || 'web'}`);
    } else {
      router.push(`/rsearch/?q=${encodeURIComponent(searchTerm)}&mode=${searchMode || 'web'}&refine=${enableQueryRefinement}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Logo className="transform hover:scale-105 transition-transform duration-300" />
            <p className="text-orange-600 text-[12px] sm:text-sm font-small bg-orange-100/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm text-center max-w-[90vw] mx-auto whitespace-nowrap">
              {process.env.NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT}
            </p>
        </div>

        {/* Search Section */}
        <div className="mt-4 w-full max-w-2xl">
                      <div className="relative group">
              <Meteors number={30} />
              <div className="relative flex flex-col gap-4 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-200/60 hover:border-orange-300/80 focus-within:border-orange-400 transition-all duration-300">
                {/* Search Input Row */}
                <div className="flex items-start gap-3">
                  {/* Logo Icon */}
                  <div className="flex-shrink-0 mt-4 text-orange-600">
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 52 55" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-labelledby="starIconTitle"
                    >
                      <title id="starIconTitle">rSearch Logo</title>
                      <path 
                        d="M23.0344 0.5H29.6344C32.1544 0.5 33.1144 1.34 32.8744 3.62L31.5544 17.42C31.4344 18.26 31.9144 18.5 32.5144 17.9L43.5544 9.98C45.8344 8.66 46.7944 8.78 47.9944 11.18L51.2344 16.7C52.5544 18.86 52.1944 20.18 49.9144 21.14L37.1944 27.02C36.7144 27.38 36.7144 27.74 37.1944 27.98L49.9144 33.74C52.1944 34.82 52.5544 36.02 51.1144 38.06L47.9944 43.7C46.7944 45.74 45.5944 46.22 43.5544 44.9L32.5144 36.62C32.0344 36.14 31.4344 36.5 31.5544 37.22L32.6344 51.38C32.8744 53.78 32.0344 54.5 29.6344 54.5H23.0344C20.6344 54.5 19.7944 53.78 19.9144 51.38L21.2344 37.22C21.3544 36.5 20.8744 36.14 20.2744 36.62L8.99436 44.9C7.07436 46.22 5.87436 45.74 4.67436 43.7L1.55436 38.06C0.23436 36.02 0.35436 34.82 2.75436 33.74L15.5944 27.98C16.0744 27.74 16.0744 27.38 15.5944 27.02L2.63436 21.14C0.59436 20.18 0.23436 18.86 1.55436 16.7L4.67436 11.18C5.87436 8.78 7.07436 8.66 8.99436 9.98L20.2744 17.9C20.8744 18.5 21.3544 18.26 21.2344 17.42L19.9144 3.62C19.6744 1.34 20.6344 0.5 23.0344 0.5Z" 
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  {/* Text Input */}
                  <Textarea 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="What are you looking for?" 
                    className="flex-1 text-md h-[120px] resize-none bg-transparent
                    border-none focus-visible:ring-0 focus-visible:ring-offset-0
                    placeholder:text-orange-600/70 text-orange-800 px-4 py-3 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                </div>

              {/* Control Buttons Row */}
              <div className="flex items-center gap-2 px-2">
                {/* Mode Selection Button */}
                {isDesktop ? (
                  <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen} >
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 px-4 rounded-full border border-orange-200/60 bg-white/80 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {!isDropdownOpen && searchMode 
                          ? searchModes.find(mode => mode.id === searchMode)?.label 
                          : 'Mode'
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[600px] mt-2 p-4 bg-white border-orange-200" sideOffset={8}>
                      <div className="grid grid-cols-4 grid-rows-2">
                        {searchModes.map((mode) => (
                          <DropdownMenuItem
                            key={mode.id}
                            onClick={() => {
                              setSearchMode(mode.id);
                              setIsDropdownOpen(false);
                            }}
                            className="flex flex-col items-start p-3 cursor-pointer hover:bg-orange-100/80 focus:bg-orange-100/80"
                          >
                            <div className="flex items-center gap-3">
                              <mode.icon className="h-5 w-5 text-orange-600 flex-shrink-0" />
                              <span className="font-medium text-orange-900">{mode.label}</span>
                            </div>
                            <p className="text-xs text-orange-600 leading-relaxed w-full">
                              {mode.description}
                            </p>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 px-4 rounded-full border border-orange-200/60 bg-white/80 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {searchMode 
                          ? searchModes.find(mode => mode.id === searchMode)?.label 
                          : 'Mode'
                        }
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-white border-t border-orange-200">
                      <DrawerHeader>
                        <DrawerTitle className="text-lg font-medium text-orange-700">
                          Select Search Mode
                        </DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 space-y-4">
                        {searchModes.map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            className="flex items-center gap-3 w-full p-3 hover:bg-orange-100/80 rounded-lg transition-colors"
                            onClick={() => {
                              setSearchMode(mode.id);
                              setIsDrawerOpen(false);
                            }}
                          >
                            <mode.icon className="h-5 w-5 text-orange-600 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-medium text-orange-900">{mode.label}</div>
                              <div className="text-sm text-orange-600">{mode.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}

                {/* Deep Research Toggle Button */}
                <button
                  onClick={() => setEnableDeepResearch(!enableDeepResearch)}
                  className={`h-10 px-4 rounded-full border transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                    enableDeepResearch 
                      ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600' 
                      : 'border-orange-200/60 bg-white/80 backdrop-blur-sm text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span className="text-sm font-medium">Deep Research</span>
                </button>
              </div>



              {/* Search Button Row */}
              <div className="flex items-center justify-center px-2">
                <Button 
                  onClick={handleSearch}
                  size="icon"
                  className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white
                  transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105 active:scale-95"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Generator Call-to-Action */}
        <div className="mt-8 text-center">
          <Link 
            href="/image" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm"
          >
            <Sparkles className="h-4 w-4" />
            Try our new AI Image Generator
          </Link>
        </div>

        {/* SEO Content Section */}
        <section className="mt-16 max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-8 border border-orange-200/50">
            <h2 className="text-2xl font-bold text-orange-900 mb-6 text-center">
              The Most Advanced AI-Powered Reasoning Engine
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🤖 Advanced AI Reasoning
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  rSearch leverages cutting-edge AI reasoning models to provide intelligent, 
                  well-reasoned responses to complex queries. Unlike traditional search engines, 
                  rSearch thinks through problems step-by-step, delivering insights rather than just results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🔍 Multi-Source Search Capabilities
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Search across web, images, videos, news, academic papers, patents, shopping, and places. 
                  rSearch combines the power of AI reasoning with comprehensive internet search to give you 
                  the most relevant and insightful results.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">
                  🆓 Free Alternative to Perplexity
                </h3>
                <p className="text-orange-700 leading-relaxed">
                  Get the same advanced AI reasoning capabilities as Perplexity AI, but completely free. 
                  rSearch offers a powerful alternative to expensive AI search engines with no usage limits 
                  or subscription fees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search Modes Highlight Section */}
        <section className="mt-12 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-200/50">
            <h2 className="text-2xl font-bold text-orange-900 mb-6 text-center">
              Comprehensive Search Modes Available
            </h2>
            <p className="text-orange-700 text-center mb-8 leading-relaxed">
              Choose from 8 different search modes to find exactly what you&apos;re looking for across the entire internet
            </p>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Web Search</h3>
                <p className="text-xs text-orange-700">
                  Comprehensive internet search
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <BookText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Image Search</h3>
                <p className="text-xs text-orange-700">
                  Find visual content
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <Video className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Video Search</h3>
                <p className="text-xs text-orange-700">
                  Discover videos
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <Newspaper className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">News Search</h3>
                <p className="text-xs text-orange-700">
                  Latest news updates
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Places Search</h3>
                <p className="text-xs text-orange-700">
                  Find locations & businesses
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <ShoppingBag className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Shopping Search</h3>
                <p className="text-xs text-orange-700">
                  Products & deals
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <GraduationCap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Scholar Search</h3>
                <p className="text-xs text-orange-700">
                  Academic papers
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50/50 rounded-xl">
                <Lightbulb className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-orange-800 mb-1">Patent Search</h3>
                <p className="text-xs text-orange-700">
                  Patent databases
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-12 max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-orange-900 mb-6 text-center">
            Why Choose rSearch Over Other AI Search Engines?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Advanced Reasoning</h3>
              <p className="text-sm text-orange-700">
                Chain-of-thought reasoning for complex problem solving
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">8 Search Modes</h3>
              <p className="text-sm text-orange-700">
                Web, images, videos, news, scholar, patents, shopping & places
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Free & Open</h3>
              <p className="text-sm text-orange-700">
                No usage limits, no subscription fees, completely free
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Now at the bottom */}
      <footer className="mt-auto relative">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-300/40 via-orange-200/30 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center gap-4">
            {/* Links Section */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium pb-4 border-b border-orange-200/30">
              <Link 
                href="/terms" 
                className="text-orange-800/90 hover:text-orange-900 transition-colors  hover:scale-105 transform duration-200"
              >
                Terms
              </Link>
              <span className="hidden md:inline text-orange-400">•</span>
              <Link 
                href="/privacy" 
                className="text-orange-800/90 hover:text-orange-900 transition-colors  hover:scale-105 transform duration-200"
              >
                Privacy
              </Link>
              <span className="hidden md:inline text-orange-400">•</span>
              <Link 
                href="/about" 
                className="text-orange-800/90 hover:text-orange-900 transition-colors  hover:scale-105 transform duration-200"
              >
                About
              </Link>
            </div>

            {/* Credits Section */}
            <div className="flex flex-row items-center gap-4 text-sm pt-2">
              <a 
                href="https://www.x.com/justmalhar/" 
                className="text-orange-700/90 hover:text-orange-800 transition-colors  hover:scale-105 transform duration-200 whitespace-nowrap hover:bg-orange-100/50 px-3 py-1 rounded-full"
              >
                Made with ❤️ and AI by @justmalhar
              </a>
              <span className="hidden md:inline text-orange-400">•</span>
              <a 
                href="https://github.com/Justmalhar/rsearch.git" 
                className="hidden md:flex text-orange-700/90 hover:text-orange-800 transition-colors  hover:scale-105 transform duration-200 items-center gap-2 hover:bg-orange-100/50 px-3 py-1 rounded-full"
              >
                <svg 
                  className="w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  role="img"
                  aria-labelledby="githubIconTitle"
                >
                  <title id="githubIconTitle">GitHub Icon</title>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
