import Link from 'next/link';
import { ArrowLeft, Zap, Globe, Heart, Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-orange-900 mb-4">
            Join the rSearch Team
          </h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            Help us build the future of AI-powered search and reasoning
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Our Mission</h2>
            <p className="text-orange-700 leading-relaxed mb-6">
              At rSearch, we&apos;re on a mission to democratize AI-powered reasoning and search capabilities. 
              We believe that intelligent, well-reasoned responses to complex queries should be accessible to everyone, 
              not just those who can afford premium AI services.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">Innovation</h3>
                <p className="text-sm text-orange-700">
                  Pushing the boundaries of AI reasoning and search technology
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">Accessibility</h3>
                <p className="text-sm text-orange-700">
                  Making advanced AI capabilities free and open to everyone
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-orange-800 mb-2">Impact</h3>
                <p className="text-sm text-orange-700">
                  Empowering users with intelligent search and reasoning tools
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-900 text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800 mb-3">Open Source First</h3>
              <p className="text-orange-700">
                We believe in transparency and community collaboration. Our code is open source, 
                and we actively contribute to the broader AI and search communities.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800 mb-3">User-Centric Design</h3>
              <p className="text-orange-700">
                Every feature we build is designed with our users in mind. We prioritize 
                simplicity, speed, and intelligent functionality.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800 mb-3">Continuous Learning</h3>
              <p className="text-orange-700">
                We&apos;re constantly learning and adapting. The AI landscape evolves rapidly, 
                and we stay at the forefront of new developments.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-xl font-semibold text-orange-800 mb-3">Quality Over Quantity</h3>
              <p className="text-orange-700">
                We focus on building exceptional features rather than rushing to release. 
                Quality and reliability are our top priorities.
              </p>
            </div>
          </div>
        </section>

        {/* Current Openings */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-900 text-center mb-8">Current Openings</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-orange-800 mb-2">Senior Full Stack Developer</h3>
                  <p className="text-orange-600 text-sm">Remote • Full-time</p>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Open
                </span>
              </div>
              <p className="text-orange-700 mb-4">
                We&apos;re looking for an experienced full-stack developer to help us scale rSearch 
                and build new features. You&apos;ll work with modern technologies like Next.js, 
                TypeScript, and AI APIs.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">Next.js</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">TypeScript</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">AI/ML</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">Search APIs</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-orange-800 mb-2">AI/ML Engineer</h3>
                  <p className="text-orange-600 text-sm">Remote • Full-time</p>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Open
                </span>
              </div>
              <p className="text-orange-700 mb-4">
                Join our AI team to improve our reasoning capabilities and integrate new 
                language models. You&apos;ll work on cutting-edge AI technologies and help 
                shape the future of intelligent search.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">Python</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">LLMs</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">RAG</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">Vector DB</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-orange-800 mb-2">Product Designer</h3>
                  <p className="text-orange-600 text-sm">Remote • Full-time</p>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Open
                </span>
              </div>
              <p className="text-orange-700 mb-4">
                Help us create intuitive and beautiful user experiences. You&apos;ll work on 
                designing interfaces that make complex AI capabilities accessible and 
                enjoyable to use.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">Figma</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">UX Design</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">User Research</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">Prototyping</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Don&apos;t See a Perfect Fit?</h2>
            <p className="text-orange-700 mb-6 max-w-2xl mx-auto">
              We&apos;re always looking for talented individuals who are passionate about AI, 
              search technology, and making a positive impact. Even if you don&apos;t see a 
              specific role that matches your skills, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Get in Touch
              </Link>
              <a 
                href="mailto:careers@rsearch.app" 
                className="border border-orange-300 text-orange-700 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                careers@rsearch.app
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}