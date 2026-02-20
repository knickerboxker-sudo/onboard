import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm"
          style={{ color: "var(--color-muted)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <h1 className="text-3xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Privacy Policy
        </h1>
        <p className="mt-2"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>Last updated: February 2026</p>
      </div>

      {/* Introduction */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          1. Introduction
        </h2>
        <p className="text-sm leading-relaxed">
          Sortir (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates a
          business partnership discovery platform that helps local businesses
          find, connect with, and collaborate with complementary partners in
          their area. We are based in Michigan, United States.
        </p>
        <p className="text-sm leading-relaxed">
          This Privacy Policy explains how we collect, use, share, and protect
          your personal information when you use the Sortir platform, including
          our website, application, and related services (collectively, the
          &quot;Service&quot;). By creating an account or using our Service, you
          agree to the practices described in this policy.
        </p>
      </div>

      {/* Information We Collect */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          2. Information We Collect
        </h2>
        <p className="text-sm leading-relaxed">
          We collect information you provide directly, information generated
          through your use of the Service, and limited technical data collected
          automatically.
        </p>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Account Information
        </h2>
        <p className="text-sm leading-relaxed">
          When you create a Sortir account, we collect:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Email address (used for authentication and communications)</li>
          <li>Your name</li>
          <li>
            Password (securely hashed; we never store or have access to your
            plaintext password)
          </li>
        </ul>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Business Profile Data
        </h2>
        <p className="text-sm leading-relaxed">
          To help match you with potential partners, we collect information about
          your business, including:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Business name and description</li>
          <li>Business category and industry</li>
          <li>City and address</li>
          <li>Products and services offered</li>
          <li>Social media links and website URL</li>
          <li>Partnership preferences and goals</li>
          <li>Business logo and images</li>
        </ul>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Verification Documents
        </h2>
        <p className="text-sm leading-relaxed">
          To verify the legitimacy of businesses on the platform, we may collect:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Business license documentation</li>
          <li>Storefront or location photos</li>
          <li>Tax identification documents</li>
          <li>Social media account links for verification purposes</li>
          <li>Website URLs</li>
        </ul>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Usage &amp; Activity Data
        </h2>
        <p className="text-sm leading-relaxed">
          As you use the platform, we collect data about your activity,
          including:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Connection requests and partner discovery interactions</li>
          <li>Partnership agreements you create or participate in</li>
          <li>ROI tracking metrics related to your partnerships</li>
          <li>Feature usage and page views</li>
        </ul>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Communications
        </h2>
        <p className="text-sm leading-relaxed">
          We store messages you send and receive through the Sortir messaging
          system to facilitate partner communications and to provide you with
          your message history.
        </p>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Device &amp; Log Data
        </h2>
        <p className="text-sm leading-relaxed">
          We automatically collect limited technical information when you access
          the Service, such as your browser type, operating system, IP address,
          referring URLs, and access timestamps. This data helps us maintain
          security and improve platform performance.
        </p>

        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Location Data
        </h2>
        <p className="text-sm leading-relaxed">
          We use city-level location information you provide in your business
          profile for partner matching purposes. We do not collect precise GPS
          location data from your device.
        </p>
      </div>

      {/* How We Use Your Information */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          3. How We Use Your Information
        </h2>
        <p className="text-sm leading-relaxed">
          We use the information we collect for the following purposes:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Provide and operate the Service:</strong> Create and
            maintain your account, display your business profile, and enable
            platform features.
          </li>
          <li>
            <strong>Match businesses with partners:</strong> Use your business
            profile, category, location, and partnership preferences to
            recommend and surface relevant partnership opportunities.
          </li>
          <li>
            <strong>Process verifications:</strong> Review verification
            documents to confirm the legitimacy of businesses on the platform
            and maintain trust among users.
          </li>
          <li>
            <strong>Facilitate communications:</strong> Enable messaging between
            matched businesses and deliver notifications about partnership
            activity.
          </li>
          <li>
            <strong>Improve the platform:</strong> Analyze usage patterns,
            feature adoption, and aggregate analytics to enhance existing
            features, develop new ones, and fix issues.
          </li>
          <li>
            <strong>Communicate with you:</strong> Send service-related emails
            including account confirmations, security alerts, partnership
            updates, and product announcements.
          </li>
          <li>
            <strong>Enforce our terms:</strong> Detect, investigate, and prevent
            fraudulent, unauthorized, or illegal activity and enforce our Terms
            of Service.
          </li>
        </ul>
      </div>

      {/* How We Share Your Information */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          4. How We Share Your Information
        </h2>
        <p className="text-sm leading-relaxed">
          We do not sell, rent, or trade your personal information to third
          parties. We share your information only in the following limited
          circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Public profile information:</strong> Your business name,
            description, category, city, products/services, logo, images, and
            social links are visible to other authenticated businesses on the
            platform as part of the partner discovery experience.
          </li>
          <li>
            <strong>Service providers:</strong> We use Supabase for hosting,
            database infrastructure, authentication, and file storage. Supabase
            processes your data on our behalf and is contractually obligated to
            protect it.
          </li>
          <li>
            <strong>Legal requirements:</strong> We may disclose your
            information if required to do so by law, regulation, legal process,
            or enforceable governmental request, or to protect the rights,
            property, or safety of Sortir, our users, or the public.
          </li>
          <li>
            <strong>Business transfers:</strong> If Sortir is involved in a
            merger, acquisition, or sale of assets, your information may be
            transferred as part of that transaction. We will notify you via
            email or a prominent notice on the platform before your information
            becomes subject to a different privacy policy.
          </li>
        </ul>
      </div>

      {/* Data Storage & Security */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          5. Data Storage &amp; Security
        </h2>
        <p className="text-sm leading-relaxed">
          Your data is stored on Supabase&apos;s hosted infrastructure, which
          uses PostgreSQL databases with industry-standard security practices.
          All data transmitted between your device and our servers is encrypted
          in transit using TLS/SSL.
        </p>
        <p className="text-sm leading-relaxed">
          We implement reasonable administrative, technical, and physical
          safeguards designed to protect your information from unauthorized
          access, alteration, disclosure, or destruction. These measures include
          access controls, secure authentication, and regular review of our data
          handling practices.
        </p>
        <p className="text-sm leading-relaxed">
          While we strive to protect your personal information, no method of
          transmission over the Internet or method of electronic storage is
          completely secure. We cannot guarantee absolute security of your data.
        </p>
      </div>

      {/* Your Rights & Choices */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          6. Your Rights &amp; Choices
        </h2>
        <p className="text-sm leading-relaxed">
          You have the following rights regarding your personal information:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Access and update:</strong> You can access and update your
            business profile, account information, and preferences at any time
            through your account settings.
          </li>
          <li>
            <strong>Delete your account:</strong> You may request deletion of
            your account and associated data by contacting us at{" "}
            <a
              href="mailto:hello@sortir.app"
              style={{ color: "var(--color-accent)", textDecoration: "underline" }}
            >
              hello@sortir.app
            </a>
            . Upon receiving your request, we will delete your personal data
            within 30 days, except where we are required to retain it for legal
            or legitimate business purposes.
          </li>
          <li>
            <strong>Opt out of marketing emails:</strong> You can unsubscribe
            from promotional communications at any time by clicking the
            &quot;unsubscribe&quot; link in any marketing email. You will
            continue to receive essential service-related communications.
          </li>
          <li>
            <strong>Data portability:</strong> You may request a copy of your
            personal data in a structured, commonly used format by contacting us
            at{" "}
            <a
              href="mailto:hello@sortir.app"
              style={{ color: "var(--color-accent)", textDecoration: "underline" }}
            >
              hello@sortir.app
            </a>
            .
          </li>
        </ul>
      </div>

      {/* Cookies & Tracking */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          7. Cookies &amp; Tracking
        </h2>
        <p className="text-sm leading-relaxed">
          We use cookies and similar technologies for essential platform
          functionality:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Session cookies:</strong> Used to maintain your
            authenticated session and remember your login state. These are
            necessary for the Service to function properly.
          </li>
          <li>
            <strong>Preference cookies:</strong> Used to remember your settings
            and preferences across visits.
          </li>
        </ul>
        <p className="text-sm leading-relaxed">
          We do not use third-party advertising cookies or tracking pixels. We
          do not participate in any third-party ad networks, and we do not allow
          advertisers to track you on our platform.
        </p>
      </div>

      {/* Children's Privacy */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          8. Children&apos;s Privacy
        </h2>
        <p className="text-sm leading-relaxed">
          Sortir is a business-to-business platform and is not intended for use
          by individuals under the age of 18. We do not knowingly collect
          personal information from anyone under 18 years of age. If we become
          aware that we have collected personal information from a person under
          18, we will take steps to delete that information promptly. If you
          believe a minor has provided us with personal information, please
          contact us at{" "}
          <a
            href="mailto:hello@sortir.app"
            style={{ color: "var(--color-accent)", textDecoration: "underline" }}
          >
            hello@sortir.app
          </a>
          .
        </p>
      </div>

      {/* Third-Party Links */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          9. Third-Party Links
        </h2>
        <p className="text-sm leading-relaxed">
          Business profiles on Sortir may contain links to external websites,
          social media accounts, and other online resources operated by partner
          businesses or third parties. We are not responsible for the privacy
          practices, content, or security of any third-party websites or
          services. We encourage you to review the privacy policies of any
          third-party sites you visit through links on our platform.
        </p>
      </div>

      {/* Data Retention */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          10. Data Retention
        </h2>
        <p className="text-sm leading-relaxed">
          We retain your personal information for as long as your account is
          active or as needed to provide you with the Service. Specifically:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>
            <strong>Account and profile data:</strong> Retained for the duration
            of your active account.
          </li>
          <li>
            <strong>Messages and partnership data:</strong> Retained while your
            account is active to maintain your communication and collaboration
            history.
          </li>
          <li>
            <strong>Verification documents:</strong> Retained for the duration
            of your account to support ongoing trust and verification status.
          </li>
          <li>
            <strong>Usage and analytics data:</strong> Retained in aggregated or
            anonymized form for platform improvement purposes.
          </li>
        </ul>
        <p className="text-sm leading-relaxed">
          When you delete your account, we will delete or anonymize your
          personal data within 30 days, except where retention is required by
          law (e.g., tax or legal compliance) or necessary to resolve disputes
          or enforce our agreements. Anonymized or aggregated data that cannot
          identify you may be retained indefinitely.
        </p>
      </div>

      {/* Changes to This Policy */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          11. Changes to This Policy
        </h2>
        <p className="text-sm leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, legal requirements, or platform features. When we
          make material changes, we will notify you by email to the address
          associated with your account or by posting a prominent notice on the
          platform prior to the changes taking effect.
        </p>
        <p className="text-sm leading-relaxed">
          We encourage you to review this policy periodically. The &quot;Last
          updated&quot; date at the top of this page indicates when the policy
          was most recently revised. Your continued use of the Service after any
          changes constitutes your acceptance of the updated policy.
        </p>
      </div>

      {/* Contact Us */}
      <div className="sortir-card-elevated space-y-4"
        style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
        <h2 className="text-lg"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          12. Contact Us
        </h2>
        <p className="text-sm leading-relaxed">
          If you have any questions about this Privacy Policy, want to exercise
          your data rights, or have concerns about how we handle your
          information, please contact us:
        </p>
        <p className="text-sm leading-relaxed">
          <strong>Email:</strong>{" "}
          <a
            href="mailto:hello@sortir.app"
            style={{ color: "var(--color-accent)", textDecoration: "underline" }}
          >
            hello@sortir.app
          </a>
        </p>
        <p className="text-sm leading-relaxed">
          We will respond to all legitimate requests within 30 days. In certain
          circumstances, we may need to verify your identity before processing
          your request.
        </p>
      </div>
    </div>
  );
}
