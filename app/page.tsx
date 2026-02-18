import Link from "next/link";
import { LandingAnimations } from "./components/LandingAnimations";
import { PartnershipMarquee } from "./components/PartnershipMarquee";

const features = [
  {
    number: "01",
    title: "Verified businesses",
    description:
      "Earn trust badges through business license verification and partnership track record.",
  },
  {
    number: "02",
    title: "Partnership Builder",
    description:
      "Use our equity assessment tool to structure fair deals — from revenue splits to commission models.",
  },
  {
    number: "03",
    title: "Track partnership ROI",
    description:
      "Measure real value with built-in tracking of revenue generated, customers acquired, and performance benchmarks.",
  },
  {
    number: "04",
    title: "Ready-to-use templates",
    description:
      "Get started with pre-built agreement templates for consignment, commission splits, cross-promotion, and event collaborations.",
  },
];

const partnershipExamples = [
  { businesses: "Gym + Meal Prep Service",             result: "Member nutrition package",         description: "Pair workout plans with weekly meal prep—give members a true lifestyle bundle." },
  { businesses: "Bookstore + Coffee Shop",             result: "Reading events & refreshments",    description: "Host book clubs and author nights with a café pop-up inside the store." },
  { businesses: "Salon + Boutique",                    result: "Style makeover packages",          description: "Book a cut and walk out with a new outfit—one appointment, a full new look." },
  { businesses: "Real Estate Agent + Mortgage Broker", result: "One-stop home buying experience",  description: "Guide buyers from house-hunting to closing without juggling multiple contacts." },
  { businesses: "Accountant + Attorney",               result: "Business startup bundle",          description: "Help new owners get legally registered and financially set from day one." },
  { businesses: "Dog Walker + Pet Groomer",            result: "All-in pet care subscription",     description: "Combine daily walks with monthly grooming into one hassle-free pet care plan." },
  { businesses: "Personal Trainer + Nutritionist",     result: "Total transformation package",     description: "Align fitness goals with customized meal plans for faster, lasting results." },
  { businesses: "Wedding Photographer + Florist",      result: "Memory & beauty package",          description: "Coordinate blooms and photos so the flowers and shots always complement each other." },
  { businesses: "Lawn Care Co. + Landscaper",          result: "Full outdoor maintenance plan",    description: "Keep lawns mowed and gardens designed under one recurring service agreement." },
  { businesses: "Hair Product Brand + Salon",          result: "In-store display & samples",       description: "Put your products in customers' hands at the exact moment they need them." },
  { businesses: "Online Boutique + Local Pop-up",      result: "IRL shopping experience",          description: "Bring your digital store to life with seasonal in-person shopping events." },
  { businesses: "Freelance Photographer + Venue",      result: "Preferred vendor partnership",     description: "Get referred to every couple and host who books the space." },
  { businesses: "Juice Bar + Yoga Studio",             result: "Post-class smoothie deal",         description: "Reward students with a discount at the juice bar right after class." },
  { businesses: "Bakery + Coffee Shop",                result: "Morning bundle offer",             description: "Pair a fresh pastry with every specialty coffee order to boost both businesses." },
  { businesses: "Chiropractor + Massage Therapist",    result: "Complete pain relief program",     description: "Tackle muscle and alignment issues together for faster patient recovery." },
  { businesses: "Web Designer + Marketing Agency",     result: "Full digital launch package",      description: "Deliver clients a complete online presence—site, brand, and growth strategy." },
  { businesses: "Coworking Space + Coffee Shop",       result: "Member daily coffee perk",         description: "Give coworking members a daily coffee credit to keep them energized and loyal." },
  { businesses: "Print Shop + Graphic Designer",       result: "Design-to-print service",          description: "Handle everything from concept to finished product under one creative roof." },
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
  { stat: "Free · Always",       label: "No paywall, no credit card" },
  { stat: "Every business type", label: "Brick-and-mortar, online & freelancers" },
  { stat: "100 to unlock",       label: "Your city opens at 100 businesses" },
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
                className="btn-primary"
                href="/auth"
              >
                Create your free account
              </Link>
              <Link
                className="transition-colors"
                href="/#how-it-works"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-muted)',
                }}
              >
                See how it works
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
            className="grid grid-cols-1 sm:grid-cols-2"
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
        <PartnershipMarquee examples={partnershipExamples} />
        <p
          className="mt-4 px-6 sm:px-12"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.06em',
            color: 'var(--color-muted)',
            opacity: 0.7,
          }}
        >
          Hover to pause · drag or scroll to explore
        </p>
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
              Create your free account and start building local partnerships today. No credit card, no subscription, no paywall — ever.
            </p>
            <div>
              <Link
                className="btn-cta-outline"
                href="/auth"
              >
                Create your free account
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
