import Link from 'next/link';
import { ExternalLink, Heart, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto relative">
      <div className="absolute inset-0 bg-gradient-to-t from-orange-300/40 via-orange-200/30 to-transparent pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6">
          
          {/* Main Links Section */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium pb-6 border-b border-orange-200/30">
            <Link 
              href="/blog" 
              className="text-orange-800/90 hover:text-orange-900 transition-colors hover:scale-105 transform duration-200 flex items-center gap-1"
            >
              Blog
            </Link>
            <Link 
              href="/careers" 
              className="text-orange-800/90 hover:text-orange-900 transition-colors hover:scale-105 transform duration-200 flex items-center gap-1"
            >
              Careers
            </Link>
            <Link 
              href="/contact" 
              className="text-orange-800/90 hover:text-orange-900 transition-colors hover:scale-105 transform duration-200 flex items-center gap-1"
            >
              Contact
            </Link>
            <a 
              href="https://www.instagram.com/rsearchapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-800/90 hover:text-orange-900 transition-colors hover:scale-105 transform duration-200 flex items-center gap-1"
            >
              Instagram
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://www.linkedin.com/company/rsearchapp/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-800/90 hover:text-orange-900 transition-colors hover:scale-105 transform duration-200 flex items-center gap-1"
            >
              LinkedIn
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Secondary Links Section */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium pb-4 border-b border-orange-200/30">
            <Link 
              href="/terms" 
              className="text-orange-700/80 hover:text-orange-800 transition-colors hover:scale-105 transform duration-200"
            >
              Terms
            </Link>
            <span className="hidden md:inline text-orange-400">•</span>
            <Link 
              href="/privacy" 
              className="text-orange-700/80 hover:text-orange-800 transition-colors hover:scale-105 transform duration-200"
            >
              Privacy
            </Link>
            <span className="hidden md:inline text-orange-400">•</span>
            <Link 
              href="/about" 
              className="text-orange-700/80 hover:text-orange-800 transition-colors hover:scale-105 transform duration-200"
            >
              About
            </Link>
          </div>

          {/* Credits Section */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm pt-2">
            <a 
              href="https://www.x.com/justmalhar/" 
              className="text-orange-700/90 hover:text-orange-800 transition-colors hover:scale-105 transform duration-200 whitespace-nowrap hover:bg-orange-100/50 px-3 py-1 rounded-full flex items-center gap-1"
            >
              Made with <Heart className="w-3 h-3 text-red-500" /> and AI by @justmalhar
            </a>
            <span className="hidden md:inline text-orange-400">•</span>
            <a 
              href="https://github.com/Justmalhar/rsearch.git" 
              className="text-orange-700/90 hover:text-orange-800 transition-colors hover:scale-105 transform duration-200 flex items-center gap-2 hover:bg-orange-100/50 px-3 py-1 rounded-full"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-orange-600/70 text-center">
            © 2024 rSearch. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}