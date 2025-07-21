import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Github, Twitter, Linkedin, Instagram, Send } from 'lucide-react';

export default function ContactPage() {
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
            Get in Touch
          </h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            Have questions, feedback, or want to collaborate? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          {/* General Inquiries */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-900">General Inquiries</h3>
                <p className="text-orange-600 text-sm">Questions about rSearch</p>
              </div>
            </div>
            <p className="text-orange-700 mb-4">
              Have questions about our AI-powered search engine, features, or how to get the most out of rSearch?
            </p>
            <a 
              href="mailto:hello@rsearch.app" 
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@rsearch.app
            </a>
          </div>

          {/* Support */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-900">Technical Support</h3>
                <p className="text-orange-600 text-sm">Help with issues or bugs</p>
              </div>
            </div>
            <p className="text-orange-700 mb-4">
              Experiencing technical issues, bugs, or need help with specific features?
            </p>
            <a 
              href="mailto:support@rsearch.app" 
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              support@rsearch.app
            </a>
          </div>

          {/* Careers */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Send className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-900">Careers</h3>
                <p className="text-orange-600 text-sm">Join our team</p>
              </div>
            </div>
            <p className="text-orange-700 mb-4">
              Interested in joining our team? We're always looking for talented individuals passionate about AI and search technology.
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="mailto:careers@rsearch.app" 
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                careers@rsearch.app
              </a>
              <Link 
                href="/careers" 
                className="inline-flex items-center gap-2 border border-orange-300 text-orange-700 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                View Open Positions
              </Link>
            </div>
          </div>

          {/* Partnerships */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-900">Partnerships</h3>
                <p className="text-orange-600 text-sm">Business opportunities</p>
              </div>
            </div>
            <p className="text-orange-700 mb-4">
              Interested in partnering with rSearch? We're open to collaborations, integrations, and business opportunities.
            </p>
            <a 
              href="mailto:partnerships@rsearch.app" 
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              partnerships@rsearch.app
            </a>
          </div>
        </div>

        {/* Social Media Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-900 text-center mb-8">Connect With Us</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <a 
              href="https://github.com/Justmalhar/rsearch.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-md border border-orange-100 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <Github className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">GitHub</h3>
              <p className="text-sm text-orange-700">Open source contributions</p>
            </a>

            <a 
              href="https://www.x.com/justmalhar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-md border border-orange-100 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <Twitter className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Twitter</h3>
              <p className="text-sm text-orange-700">Latest updates & news</p>
            </a>

            <a 
              href="https://www.linkedin.com/company/rsearchapp/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-md border border-orange-100 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <Linkedin className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">LinkedIn</h3>
              <p className="text-sm text-orange-700">Professional network</p>
            </a>

            <a 
              href="https://www.instagram.com/rsearchapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-md border border-orange-100 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                <Instagram className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-800 mb-2">Instagram</h3>
              <p className="text-sm text-orange-700">Behind the scenes</p>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-orange-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Is rSearch really free?</h3>
              <p className="text-orange-700">
                Yes! rSearch is completely free to use with no usage limits or subscription fees. 
                We believe that advanced AI capabilities should be accessible to everyone.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">How does rSearch work?</h3>
              <p className="text-orange-700">
                rSearch combines advanced language models with comprehensive internet search to provide 
                intelligent, well-reasoned responses. It uses chain-of-thought reasoning to break down 
                complex queries and provide detailed, accurate answers.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Can I use rSearch for commercial purposes?</h3>
              <p className="text-orange-700">
                Yes, you can use rSearch for both personal and commercial purposes. However, 
                we recommend reviewing our terms of service for specific usage guidelines.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">How can I contribute to rSearch?</h3>
              <p className="text-orange-700">
                rSearch is open source! You can contribute by submitting issues, feature requests, 
                or pull requests on our GitHub repository. We welcome contributions from the community.
              </p>
            </div>
          </div>
        </section>

        {/* Response Time Notice */}
        <section className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Response Time</h2>
            <p className="text-orange-700 mb-6 max-w-2xl mx-auto">
              We typically respond to inquiries within 24-48 hours during business days. 
              For urgent technical issues, please include "URGENT" in your subject line.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-orange-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                General inquiries: 24-48 hours
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Technical support: 12-24 hours
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Urgent issues: 2-4 hours
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}