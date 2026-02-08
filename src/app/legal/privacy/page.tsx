import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - sortir",
  description: "Learn how sortir handles your data and protects your privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
              <p className="text-sm text-muted mt-1">Last updated: February 8, 2026</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-8 space-y-6 text-ink">
            <section>
              <h2 className="text-xl font-semibold mb-3">Introduction</h2>
              <p className="text-muted leading-relaxed">
                sortir is a simple informational website that aggregates publicly available recall data
                from U.S. government agencies. We believe in transparency and protecting your privacy.
                This policy explains how we handle your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
              <div className="space-y-3 text-muted leading-relaxed">
                <p>
                  <strong className="text-ink">Search Queries:</strong> When you search for recalls,
                  your search terms are processed in real-time to fetch results from government APIs.
                  We do not store or log your search queries permanently.
                </p>
                <p>
                  <strong className="text-ink">Feedback:</strong> If you submit feedback, we collect
                  your name and email address (if provided) along with your message. This information
                  is sent directly to our team via email and is not stored in a database.
                </p>
                <p>
                  <strong className="text-ink">Usage Data:</strong> We collect anonymous technical
                  data like page views and error rates to monitor performance. This data is aggregated
                  and cannot be used to identify you.
                </p>
                <p>
                  <strong className="text-ink">Cookies:</strong> We use essential cookies for basic
                  functionality like maintaining your session and caching search results. We do not
                  use tracking cookies or third-party analytics cookies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
                <li>To provide search results from government recall databases</li>
                <li>To respond to your feedback and support requests</li>
                <li>To improve the website and fix bugs</li>
                <li>To monitor for security issues and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
              <p className="text-muted leading-relaxed">
                We <strong className="text-ink">do not sell, rent, or share</strong> your personal
                information with third parties for marketing purposes. The only information we share is:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 text-muted leading-relaxed">
                <li>With government APIs when you perform a search (they may log requests)</li>
                <li>With our hosting provider (Railway) as necessary to operate the service</li>
                <li>When required by law or to protect our legal rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Storage and Security</h2>
              <p className="text-muted leading-relaxed">
                sortir is a stateless application - we do not maintain a database. Search results are
                cached temporarily (30 minutes) in server memory and are automatically cleared. Feedback
                submissions are sent via encrypted email (SMTP over TLS) and are not stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-muted leading-relaxed mb-2">
                Because we collect minimal data and don't maintain a database, there's very little
                information to access or delete. However, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
                <li>Know what personal information we have (which is minimal)</li>
                <li>Request deletion of any feedback you've sent us</li>
                <li>Stop using the service at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
              <p className="text-muted leading-relaxed">
                sortir is not directed at children under 13. We do not knowingly collect information
                from children. If you believe a child has submitted information to us, please contact
                us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
              <p className="text-muted leading-relaxed">
                We may update this privacy policy from time to time. We will notify users of significant
                changes by updating the "Last updated" date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted leading-relaxed">
                If you have questions about this privacy policy or how we handle your data, please
                contact us through our{" "}
                <a href="/feedback" className="text-accent hover:text-accent-hover underline">
                  feedback form
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
