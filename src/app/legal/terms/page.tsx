import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service - sortir",
  description: "Terms and conditions for using sortir recall search service.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <FileText size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
              <p className="text-sm text-muted mt-1">Last updated: February 8, 2026</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-8 space-y-6 text-ink">
            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
              <p className="text-muted leading-relaxed">
                By accessing and using sortir, you accept and agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
              <p className="text-muted leading-relaxed">
                sortir is a free informational service that aggregates publicly available recall data
                from U.S. government agencies including NHTSA, CPSC, USDA FSIS, FDA, EPA, and USCG.
                We provide a unified search interface to help users find safety recalls across multiple
                categories.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">No Affiliation with Government</h2>
              <p className="text-muted leading-relaxed">
                sortir is <strong className="text-ink">not affiliated with, endorsed by, or operated by</strong> any
                U.S. government agency. We are an independent service that aggregates publicly available data.
                For official recall information, please visit the respective government agency websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Disclaimer of Warranties</h2>
              <p className="text-muted leading-relaxed mb-2">
                sortir is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind, either
                express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
                <li>Accuracy, completeness, or timeliness of recall data</li>
                <li>Availability or reliability of the service</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
              </ul>
              <p className="text-muted leading-relaxed mt-3">
                Government APIs may be unavailable, delayed, or incomplete. We aggregate data from multiple
                sources but cannot guarantee its accuracy. <strong className="text-ink">Always verify
                recall information with the original issuing agency.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
              <p className="text-muted leading-relaxed">
                To the fullest extent permitted by law, sortir and its operators shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages, or any loss of
                profits or revenues, whether incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 text-muted leading-relaxed">
                <li>Your use or inability to use the service</li>
                <li>Any inaccurate, incomplete, or outdated recall information</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Any other matter related to the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
              <p className="text-muted leading-relaxed mb-2">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to overload or abuse the service</li>
                <li>Not scrape, crawl, or automated access beyond reasonable use</li>
                <li>Not submit prohibited, harmful, or illegal content through feedback forms</li>
                <li>Verify all recall information with official sources before taking action</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Rate Limiting</h2>
              <p className="text-muted leading-relaxed">
                To ensure fair access for all users, we implement rate limiting on our API endpoints.
                Excessive use may result in temporary blocking. If you need higher limits for legitimate
                purposes, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
              <p className="text-muted leading-relaxed">
                The sortir website design, code, and branding are proprietary. Recall data itself is
                public domain information provided by U.S. government agencies. You may link to sortir
                but may not copy or redistribute our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Service Modifications</h2>
              <p className="text-muted leading-relaxed">
                We reserve the right to modify, suspend, or discontinue sortir at any time without notice.
                We may also update these Terms of Service periodically. Continued use of the service after
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Third-Party Links</h2>
              <p className="text-muted leading-relaxed">
                sortir contains links to government websites and official recall sources. We are not
                responsible for the content, policies, or practices of these external sites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
              <p className="text-muted leading-relaxed">
                These Terms of Service are governed by the laws of the United States. Any disputes
                shall be resolved in accordance with applicable federal and state laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted leading-relaxed">
                If you have questions about these Terms of Service, please contact us through our{" "}
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
