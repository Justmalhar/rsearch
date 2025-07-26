import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Meteors } from "@/components/ui/meteors";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-2xl mx-auto">
          <Meteors number={20} />
          <div className="relative flex flex-col items-center gap-8 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-200/50">
            {/* Logo */}
            <Logo className="transform hover:scale-105 transition-transform duration-300" />
            
            {/* 404 Text */}
            <h2 className="text-6xl md:text-7xl font-bold text-blue-600">
              404
            </h2>
            
            {/* Funny Message */}
            <div className="text-center space-y-4">
              <p className="text-xl text-blue-800">
                Oops! Looks like this page got lost in the research rabbit hole
              </p>
              <p className="text-blue-600 text-lg">
                Even our AI couldn&apos;t find what you&apos;re looking for 🤔
              </p>
            </div>

            {/* Back to Home Button */}
            <Link 
              href="/"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto relative py-8">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-300/40 via-blue-200/30 to-transparent pointer-events-none" />
        <div className="relative text-center text-blue-700/90">
          <p>Maybe try searching for something else? We&apos;re pretty good at that! 😉</p>
        </div>
      </footer>
    </div>
  );
}
