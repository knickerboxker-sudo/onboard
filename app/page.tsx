import Link from "next/link";
import { LandingAnimations } from "./components/LandingAnimations";

const features = [
  {
    number: "01",
    title: "Build your business profile",
    description:
      "Create a rich profile with your products, services, social links, and partnership preferences to attract the right collaborators.",
  },
  {
    number: "02",
    title: "Discover local partners",
    description:
      "Find complementary businesses in your city using location-based search and browse through potential partners.",
  },
  {
    number: "03",
    title: "Connect & collaborate",
    description:
      "Send connection requests to businesses you'd like to partner with and start collaborating right away.",
  },
  {
    number: "04",
    title: "Message your matches",
    description:
      "Chat directly with matched partners to discuss cross-promotion, product bundles, and collaboration opportunities.",
  },
  {
    number: "05",
    title: "Partnership builder",
    description:
      "Use our equity assessment tool to structure fair deals — from revenue splits to commission models and performance benchmarks.",
  },
  {
    number: "06",
    title: "Grow together",
    description:
      "Sell each other's products in-store, promote on each other's social media, and create collaboration products and services.",
  },
  {
    number: "07",
    title: "Verified businesses",
    description:
      "Earn trust badges through verification — business license, storefront photos, and successful partnership track record.",
  },
  {
    number: "08",
    title: "Track partnership ROI",
    description:
      "Measure the real value of your partnerships with built-in ROI tracking — revenue generated, customers acquired, and performance benchmarks.",
  },
  {
    number: "09",
    title: "Ready-to-use templates",
    description:
      "Get started quickly with pre-built agreement templates for consignment, commission splits, cross-promotion, and event collaborations.",
  },
];

const partnershipExamples = [
  { businesses: "Gym + Meal Prep Service", result: "Member nutrition package" },
  { businesses: "Bookstore + Coffee Shop", result: "Reading events with refreshments" },
  { businesses: "Salon + Boutique", result: "Style makeover packages" },
  { businesses: "Real Estate Agent + Mortgage Broker", result: "One-stop home buying experience" },
  { businesses: "Accountant + Attorney", result: "Business startup bundle" },
  { businesses: "Dog Walker + Pet Groomer", result: "All-in pet care subscription" },
  { businesses: "Personal Trainer + Nutritionist", result: "Total transformation package" },
  { businesses: "Wedding Photographer + Florist", result: "Memory + beauty package" },
  { businesses: "Chiropractor + Massage Therapist", result: "Complete pain relief program" },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Set up your business profile with products, services, and partnership preferences in minutes.",
  },
  {
    number: "02",
    title: "Discover & connect",
    description:
      "Browse nearby complementary businesses and send connection requests to potential partners you'd like to work with.",
  },
  {
    number: "03",
    title: "Collaborate & grow",
    description:
      "Once connected, chat, build agreements, and start growing together through smart partnerships.",
  },
];

const trustSignals = [
  { stat: "800+", label: "Local businesses waiting" },
  { stat: "3 steps", label: "To your first partnership" },
  { stat: "Free", label: "Always, to get started" },
];

export default function Home() {
  return (
    <LandingAnimations>
      {/* Hero Section */}
      <section className="relative" data-reveal>
        {/* Accent top rule */}
        <div
          className="w-full"
          style={{ height: '2px', backgroundColor: 'var(--color-accent)' }}
        />

        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16"
          style={{ paddingTop: '80px', paddingBottom: '120px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          {/* Headline — columns 1-8 */}
          <div className="lg:col-span-8">
            <h1
              className="leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                lineHeight: '1.0',
                letterSpacing: '-0.02em',
                color: 'var(--color-ink)',
              }}
            >
              Your neighborhood businesses,{" "}
              <em>stronger together.</em>
            </h1>
            <p
              className="mt-8 max-w-2xl"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '18px',
                lineHeight: '1.6',
                color: 'var(--color-muted)',
              }}
            >
              Sortir helps you find your perfect local partner — cross-promote,
              share customers, and build cooperative networks that help every
              small business on the block thrive.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                className="inline-flex items-center gap-2 transition-all"
                href="/join"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  color: 'var(--color-ink)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                }}
              >
                Join the waitlist <span style={{ fontFamily: 'var(--font-mono)' }}>→</span>
              </Link>
              <Link
                className="transition-colors"
                href="/coming-soon"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-muted)',
                }}
              >
                See launch progress
              </Link>
            </div>
          </div>

          {/* Trust signals — columns 9-12 */}
          <div className="lg:col-span-4 flex flex-col justify-center relative">
            {/* Decorative watermark */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 flex items-center overflow-hidden"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(5rem, 12vw, 10rem)',
                fontStyle: 'italic',
                color: 'rgba(13,13,13,0.04)',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              together
            </span>
            {trustSignals.map((signal, i) => (
              <div
                key={signal.stat}
                className="py-6"
                style={{
                  borderTop: i === 0 ? '1px solid var(--color-rule)' : 'none',
                  borderBottom: '1px solid var(--color-rule)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    color: 'var(--color-ink)',
                  }}
                >
                  {signal.stat}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--color-muted)',
                    marginTop: '4px',
                  }}
                >
                  {signal.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full-width rule below hero */}
        <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--color-rule)' }} />
      </section>

      {/* Feature Cards — editorial grid */}
      <section data-reveal>
        <div className="px-6 sm:px-12">
          <div className="mb-14">
            <span className="section-label">Features</span>
            <h2
              className="mt-5"
              data-reveal
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--color-ink)',
              }}
            >
              Everything you need to grow through partnerships
            </h2>
            <p
              className="mt-3 max-w-2xl"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--color-muted)',
              }}
            >
              From discovering partners to tracking results, Sortir gives you the
              complete toolkit for building successful business collaborations.
            </p>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: '0 48px' }}
          >
            {features.map((feature, i) => (
              <div
                className="py-6"
                key={feature.title}
                data-reveal
                style={{
                  borderTop: '1px solid var(--color-rule)',
                  transitionDelay: `${i * 80}ms`,
                } as React.CSSProperties}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--color-muted)',
                  }}
                >
                  {feature.number}
                </span>
                <h3
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    color: 'var(--color-ink)',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--color-muted)',
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — dark forest green section */}
      <section
        id="how-it-works"
        className="relative -mx-4 sm:-mx-6"
        data-reveal
        style={{
          backgroundColor: 'var(--color-accent-2)',
          padding: '100px 64px',
        }}
      >
        <div className="mb-12">
          <span
            className="section-label"
            style={{ color: 'rgba(245,242,235,0.5)' }}
          >
            How it works
          </span>
          <h2
            className="mt-5"
            data-reveal
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-paper)',
            }}
          >
            Three steps to your first partnership
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative py-8 sm:px-8"
              data-reveal
              style={{
                borderRight: i < steps.length - 1 ? '1px solid rgba(245,242,235,0.15)' : 'none',
                transitionDelay: `${i * 80}ms`,
              } as React.CSSProperties}
            >
              {/* Watermark number */}
              <span
                className="absolute top-4 left-4 sm:left-8 select-none"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '64px',
                  color: 'rgba(245,242,235,0.15)',
                  lineHeight: '1',
                }}
              >
                {step.number}
              </span>
              <div className="relative" style={{ paddingTop: '48px' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontStyle: 'italic',
                    color: 'var(--color-paper)',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'rgba(245,242,235,0.7)',
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Examples — scrolling marquee */}
      <section data-reveal>
        <div className="px-6 sm:px-12 mb-10">
          <span className="section-label">Partnership ideas</span>
          <h2
            className="mt-5"
            data-reveal
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-ink)',
            }}
          >
            Every business can partner
          </h2>
          <p
            className="mt-3 max-w-2xl"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--color-muted)',
            }}
          >
            From coffee shops to accountants — there&apos;s a partnership waiting
            for every type of business.
          </p>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-track">
            {/* Duplicated for seamless infinite scroll loop */}
            {[...partnershipExamples, ...partnershipExamples].map((ex, i) => (
              <div
                key={`${ex.businesses}-${i}`}
                className="marquee-pill flex-shrink-0 whitespace-nowrap transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
                style={{
                  border: '1px solid var(--color-rule)',
                  padding: '10px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <span className="pill-arrow">→</span>
                {ex.businesses} → {ex.result}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — terracotta */}
      <section
        className="relative -mx-4 sm:-mx-6"
        data-reveal
        style={{
          backgroundColor: 'var(--color-accent)',
          padding: '80px 64px',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontStyle: 'italic',
                color: 'var(--color-paper)',
                lineHeight: '1.1',
              }}
            >
              Ready to find your perfect business partner?
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'rgba(245,242,235,0.8)',
              }}
            >
              Join the waitlist for your city and be the first to know when Sortir
              launches in your neighborhood. Always free to get started.
            </p>
            <div>
              <Link
                className="btn-cta-outline"
                href="/join"
              >
                Join the Waitlist
              </Link>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'rgba(245,242,235,0.6)',
              }}
            >
              Free for all businesses · No credit card ever required
            </p>
          </div>
        </div>
      </section>
    </LandingAnimations>
  );
}
