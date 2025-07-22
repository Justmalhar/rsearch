import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-orange-700 max-w-2xl mx-auto">
            Last updated: December 2024
          </p>
        </div>

        {/* Privacy Principles */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Transparency</h3>
            </div>
            <p className="text-orange-700 text-sm">
              We believe in being transparent about how we collect, use, and protect your data.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Security</h3>
            </div>
            <p className="text-orange-700 text-sm">
              Your data is protected with industry-standard security measures and encryption.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Minimal Collection</h3>
            </div>
            <p className="text-orange-700 text-sm">
              We only collect the data necessary to provide and improve our services.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Control</h3>
            </div>
            <p className="text-orange-700 text-sm">
              You have control over your data and can request deletion at any time.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">1. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Information You Provide</h3>
                <ul className="list-disc list-inside space-y-1 text-orange-700 ml-4">
                  <li>Search queries and interactions with the Service</li>
                  <li>Feedback and communications you send to us</li>
                  <li>Information you provide when contacting support</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 text-orange-700 ml-4">
                  <li>IP address and general location information</li>
                  <li>Browser type and version</li>
                  <li>Device information and operating system</li>
                  <li>Usage patterns and analytics data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
              <li>Provide, maintain, and improve our AI-powered search services</li>
              <li>Process and respond to your search queries</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Ensure the security and integrity of our services</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
              <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist us in operating our service</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred</li>
              <li><strong>Consent:</strong> We may share information with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">4. Data Security</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your information against:
            </p>
            <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
              <li>Unauthorized access, alteration, or disclosure</li>
              <li>Data loss or destruction</li>
              <li>Malicious attacks and security breaches</li>
            </ul>
            <p className="text-orange-700 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">5. Data Retention</h2>
            <p className="text-orange-700 leading-relaxed">
              We retain your information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy. 
              Search queries and usage data are typically retained for a limited period to improve our services, 
              after which they are anonymized or deleted. You may request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">6. Your Rights and Choices</h2>
            <div className="space-y-4">
              <p className="text-orange-700 leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
                <li><strong>Access:</strong> Request information about what data we have about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-orange-700 leading-relaxed">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@rsearch.app" className="text-orange-600 hover:text-orange-700 underline">
                  privacy@rsearch.app
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-orange-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-orange-700 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze how our service is used</li>
              <li>Improve our services and user experience</li>
              <li>Provide personalized content and features</li>
            </ul>
            <p className="text-orange-700 leading-relaxed">
              You can control cookie settings through your browser preferences. However, disabling certain cookies may affect the functionality of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">8. Third-Party Services</h2>
            <p className="text-orange-700 leading-relaxed">
              Our service may integrate with third-party services and APIs (such as search providers and AI models). 
              These services have their own privacy policies, and we encourage you to review them. 
              We are not responsible for the privacy practices of these third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-orange-700 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">10. International Data Transfers</h2>
            <p className="text-orange-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">11. Changes to This Policy</h2>
            <p className="text-orange-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page 
              and updating the &quot;Last updated&quot; date. Your continued use of our service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">12. Contact Us</h2>
            <p className="text-orange-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:{' '}
              <a href="mailto:privacy@rsearch.app" className="text-orange-600 hover:text-orange-700 underline">
                privacy@rsearch.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}