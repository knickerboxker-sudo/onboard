import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-neutral-500">Last updated: February 2026</p>
      </div>

      {/* Acceptance of Terms */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          1. Acceptance of Terms
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Welcome to Sortir. These Terms of Service (&quot;Terms&quot;) govern
          your access to and use of the Sortir platform, including our website,
          applications, and all related services (collectively, the
          &quot;Platform&quot;). By creating an account, accessing, or using the
          Platform, you agree to be bound by these Terms. If you do not agree to
          these Terms, you may not access or use the Platform.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          These Terms constitute a legally binding agreement between you and
          Sortir. Your continued use of the Platform following any modifications
          to these Terms constitutes acceptance of those changes.
        </p>
      </div>

      {/* Eligibility */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          2. Eligibility
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          To use Sortir, you must meet all of the following requirements:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>You must be at least 18 years of age.</li>
          <li>
            You must be duly authorized to represent the business entity you
            register on the Platform, with the legal authority to bind that
            business to these Terms.
          </li>
          <li>
            The business you register must be a lawful business operating in
            compliance with all applicable local, state, and federal laws and
            regulations.
          </li>
          <li>
            You must not have been previously suspended or removed from the
            Platform.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-neutral-600">
          By registering, you represent and warrant that you satisfy all of
          these eligibility requirements. Sortir reserves the right to request
          proof of eligibility at any time and to suspend or terminate accounts
          that do not meet these criteria.
        </p>
      </div>

      {/* Account Registration */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          3. Account Registration
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          To access the Platform, you must create an account using a valid email
          address. You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>
            Provide accurate, current, and complete information during
            registration and keep your account information up to date.
          </li>
          <li>
            Maintain the security and confidentiality of your login credentials
            and not share them with any third party.
          </li>
          <li>
            Accept responsibility for all activity that occurs under your
            account, whether or not authorized by you.
          </li>
          <li>
            Register only one account per business entity. Duplicate accounts
            for the same business may be merged or removed at Sortir&apos;s
            discretion.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-neutral-600">
          You must notify Sortir immediately at hello@sortir.app if you suspect
          any unauthorized access to or use of your account.
        </p>
      </div>

      {/* Platform Description */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          4. Platform Description
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir is a business partnership discovery platform designed to help
          small businesses find local partners for cross-promotion, customer
          sharing, and collaboration. The Platform provides tools including:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>
            Business profile creation with products, services, and partnership
            preferences.
          </li>
          <li>Location-based partner discovery and matching.</li>
          <li>In-app messaging between matched business partners.</li>
          <li>
            Partnership agreement builder tools, including equity assessment,
            revenue splits, and commission models.
          </li>
          <li>
            Business verification features such as business license, storefront
            photo, tax ID, social media, and website verification.
          </li>
          <li>ROI tracking for partnerships.</li>
        </ul>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir is a facilitator and technology provider only. Sortir is not a
          party to any partnership, agreement, or transaction between users.
          Sortir does not provide legal, financial, or tax advice. The
          partnership agreement builder is a convenience tool and does not
          constitute legal counsel. All agreements formed through the Platform
          are solely between the participating businesses.
        </p>
      </div>

      {/* User Content & Conduct */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          5. User Content &amp; Conduct
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          You are solely responsible for all content you submit, post, or
          display on the Platform, including your business profile information,
          messages, images, and any other materials (&quot;User Content&quot;).
          You represent and warrant that your User Content is accurate, not
          misleading, and does not violate any applicable law or the rights of
          any third party.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          When using the Platform, you agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>
            Post false, inaccurate, or misleading business information,
            including misrepresenting the nature, location, or capabilities of
            your business.
          </li>
          <li>
            Use the messaging system for spam, unsolicited advertising,
            harassment, threats, or any unlawful purpose.
          </li>
          <li>
            Upload content that is defamatory, obscene, fraudulent, or that
            infringes on the intellectual property or privacy rights of others.
          </li>
          <li>
            Impersonate another business or individual, or falsely claim an
            affiliation with any person or entity.
          </li>
          <li>
            Attempt to scrape, harvest, or collect data from other users or
            the Platform through automated means.
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the
            Platform or its underlying infrastructure.
          </li>
          <li>
            Use the Platform to facilitate any illegal activity, including but
            not limited to money laundering, fraud, or the sale of prohibited
            goods or services.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir reserves the right to remove any User Content that violates
          these Terms and to suspend or terminate accounts engaged in
          prohibited conduct, with or without notice.
        </p>
      </div>

      {/* Business Verification */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          6. Business Verification
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir offers optional verification features that allow businesses to
          submit documentation such as business licenses, storefront photos,
          tax identification numbers, social media accounts, and website URLs.
          Verification badges and statuses are displayed on business profiles
          to provide additional context to potential partners.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Verification is informational only. A verification badge does not
          constitute an endorsement, guarantee, or warranty by Sortir regarding
          the legitimacy, quality, financial standing, or trustworthiness of
          any business. Sortir does not independently audit or guarantee the
          accuracy of submitted verification materials. Users should conduct
          their own due diligence before entering into any partnership or
          agreement with another business on the Platform.
        </p>
      </div>

      {/* Partnerships & Agreements */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          7. Partnerships &amp; Agreements
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir provides tools to facilitate the creation of partnership
          agreements between businesses, including templates for equity
          assessments, revenue sharing arrangements, and commission models.
          These tools are provided for convenience and informational purposes
          only.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          You acknowledge and agree that:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>
            Sortir is not a party to any partnership or agreement formed
            between users of the Platform. All obligations, liabilities, and
            responsibilities arising from such partnerships rest solely with
            the participating businesses.
          </li>
          <li>
            Partnership agreements created using Sortir&apos;s tools are
            between the participating businesses and are not reviewed, approved,
            or endorsed by Sortir.
          </li>
          <li>
            Sortir strongly recommends that all parties seek independent legal
            counsel before entering into any partnership agreement. The
            agreement builder is not a substitute for professional legal
            advice.
          </li>
          <li>
            Sortir is not responsible for any disputes, losses, damages, or
            liabilities arising from partnerships or agreements formed through
            the Platform.
          </li>
        </ul>
      </div>

      {/* Intellectual Property */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          8. Intellectual Property
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          The Platform, including its design, features, functionality, code,
          graphics, logos, trademarks, and all other proprietary materials, is
          owned by Sortir and is protected by copyright, trademark, and other
          intellectual property laws. You may not copy, modify, distribute,
          sell, or lease any part of the Platform without Sortir&apos;s prior
          written consent.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          You retain ownership of all User Content you submit to the Platform.
          By submitting User Content, you grant Sortir a non-exclusive,
          worldwide, royalty-free, sublicensable license to use, display,
          reproduce, and distribute your User Content solely for the purpose of
          operating, promoting, and improving the Platform. This license
          terminates when you delete your User Content or your account, except
          where your content has been shared with other users or third parties
          and they have not deleted it.
        </p>
      </div>

      {/* Disclaimers */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          9. Disclaimers
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          THE PLATFORM IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
          AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
          IMPLIED, OR STATUTORY. SORTIR EXPRESSLY DISCLAIMS ALL WARRANTIES,
          INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Without limiting the foregoing, Sortir does not warrant or guarantee:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>
            The quality, reliability, or suitability of any business or partner
            discovered through the Platform.
          </li>
          <li>
            Any specific revenue outcomes, business growth, or financial
            results from partnerships formed through the Platform.
          </li>
          <li>
            That the Platform will be uninterrupted, error-free, secure, or
            free from viruses or other harmful components.
          </li>
          <li>
            The accuracy, completeness, or timeliness of any information
            provided by other users, including business profiles and
            verification data.
          </li>
          <li>
            That the ROI tracking features will accurately reflect actual
            partnership performance or financial results.
          </li>
        </ul>
      </div>

      {/* Limitation of Liability */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          10. Limitation of Liability
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SORTIR AND ITS
          OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE
          LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA,
          BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR IN CONNECTION
          WITH YOUR USE OF THE PLATFORM, REGARDLESS OF THE THEORY OF LIABILITY.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir shall have no liability for:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>
            The outcome, success, or failure of any partnership or agreement
            formed between users of the Platform.
          </li>
          <li>
            Disputes between users, including but not limited to disagreements
            over revenue sharing, commission payments, or partnership terms.
          </li>
          <li>
            Any actions, omissions, representations, or conduct of any user or
            third party on or off the Platform.
          </li>
          <li>
            Loss or damage resulting from unauthorized access to your account
            due to your failure to safeguard your credentials.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-neutral-600">
          IN NO EVENT SHALL SORTIR&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR
          ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM
          EXCEED THE GREATER OF (A) THE AMOUNTS YOU HAVE PAID TO SORTIR IN THE
          TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS
          ($100.00).
        </p>
      </div>

      {/* Indemnification */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          11. Indemnification
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          You agree to indemnify, defend, and hold harmless Sortir and its
          officers, directors, employees, agents, and affiliates from and
          against any and all claims, liabilities, damages, losses, costs, and
          expenses (including reasonable attorneys&apos; fees) arising out of or
          in any way connected with:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-600">
          <li>Your access to or use of the Platform.</li>
          <li>Your violation of these Terms.</li>
          <li>
            Your User Content, including any claim that your content infringes
            or misappropriates the rights of a third party.
          </li>
          <li>
            Any partnership or agreement you enter into with another user of
            the Platform.
          </li>
          <li>
            Your violation of any applicable law, rule, or regulation.
          </li>
        </ul>
      </div>

      {/* Termination */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          12. Termination
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir may suspend or terminate your account and access to the
          Platform at any time, with or without cause, and with or without
          notice. Grounds for termination include, but are not limited to,
          violations of these Terms, fraudulent or illegal activity, extended
          periods of inactivity, or conduct that Sortir determines to be
          harmful to other users or the Platform.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          You may delete your account at any time through your account
          settings. Upon deletion, your business profile and associated data
          will be removed from the Platform in accordance with our{" "}
          <Link
            href="/privacy"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            Privacy Policy
          </Link>
          . Termination of your account does not relieve you of any obligations
          incurred prior to termination, including any partnership agreements
          entered into with other users.
        </p>
      </div>

      {/* Dispute Resolution */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          13. Dispute Resolution
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          These Terms and any disputes arising out of or related to these Terms
          or the Platform shall be governed by and construed in accordance with
          the laws of the State of Michigan, without regard to its conflict of
          law principles.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Before initiating any formal legal proceedings, you agree to first
          attempt to resolve any dispute informally by contacting Sortir at
          hello@sortir.app. Sortir will make reasonable efforts to resolve the
          dispute through good-faith negotiation within thirty (30) days. If
          the dispute cannot be resolved informally, either party may pursue
          formal resolution. Any legal action or proceeding shall be brought
          exclusively in the state or federal courts located in Washtenaw
          County, Michigan, and you consent to the personal jurisdiction of
          such courts.
        </p>
      </div>

      {/* Modifications */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          14. Modifications to These Terms
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir reserves the right to modify these Terms at any time. When we
          make material changes, we will update the &quot;Last updated&quot;
          date at the top of this page and may notify you through the Platform
          or via the email address associated with your account. Your continued
          use of the Platform after the revised Terms become effective
          constitutes your acceptance of the updated Terms. If you do not agree
          to the revised Terms, you must discontinue use of the Platform and
          delete your account.
        </p>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          15. Contact Information
        </h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          If you have any questions, concerns, or feedback regarding these
          Terms of Service, please contact us at{" "}
          <a
            href="mailto:hello@sortir.app"
            className="text-brand-600 hover:text-brand-700"
          >
            hello@sortir.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
