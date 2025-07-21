import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-orange-700 leading-relaxed">
              By accessing and using rSearch ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">2. Description of Service</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              rSearch is an AI-powered reasoning engine that combines advanced language models with comprehensive internet search functionality. 
              The Service provides intelligent, well-reasoned responses to user queries across multiple search modes including web, images, videos, 
              news, scholar, patents, shopping, and places.
            </p>
            <p className="text-orange-700 leading-relaxed">
              The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue the Service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">3. User Responsibilities</h2>
            <div className="space-y-4">
              <p className="text-orange-700 leading-relaxed">
                You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use the Service to transmit any harmful, offensive, or inappropriate content</li>
                <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
                <li>Use automated systems to access the Service in a manner that sends more requests than a human could reasonably produce</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">4. Privacy and Data</h2>
            <p className="text-orange-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
              to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">5. Intellectual Property</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of rSearch 
              and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
            <p className="text-orange-700 leading-relaxed">
              rSearch is open source software. You may view, modify, and distribute the source code in accordance with the applicable 
              open source license terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">6. Disclaimers</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, 
              AND HEREBY DISCLAIM ALL WARRANTIES, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-orange-700 leading-relaxed">
              We do not guarantee the accuracy, completeness, or usefulness of any information provided by the Service. 
              The Service may contain errors or inaccuracies, and we reserve the right to correct any such errors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-orange-700 leading-relaxed">
              IN NO EVENT SHALL RSEARCH BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
              INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
              RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">8. Modifications to Terms</h2>
            <p className="text-orange-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting 
              the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such 
              modifications constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">9. Governing Law</h2>
            <p className="text-orange-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which rSearch operates, 
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">10. Contact Information</h2>
            <p className="text-orange-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@rsearch.app" className="text-orange-600 hover:text-orange-700 underline">
                legal@rsearch.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}