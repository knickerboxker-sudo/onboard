import Link from "next/link";
import { LandingAnimations } from "./components/LandingAnimations";
import { PartnershipMarquee } from "./components/PartnershipMarquee";

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
    title: "Connect with freelancers & local businesses",
    description:
      "Freelancers and complementary local businesses connect with you on Sortir — and start referring their clients directly to you.",
  },
  {
    number: "03",
    title: "Earn referrals & grow revenue",
    description:
      "Every referral is free advertising. New customers walk through your door at zero ad spend, and your revenue grows.",
  },
];

const trustSignals = [
  { stat: "100% Free",      label: "No credit card, no paywall, ever" },
  { stat: "Real referrals", label: "Freelancers & local businesses send you customers" },
  { stat: "More revenue",   label: "New customers at zero ad spend" },
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
              Free advertising for your small business.{" "}
              <em>No ad spend required.</em>
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
              Sortir connects you with freelancers and complementary local businesses who refer their clients straight to you — turning every connection into free advertising that brings in real customers.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                className="btn-primary btn-primary-hero"
                href="/auth"
              >
                Get free advertising now
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
                  borderLeft: '3px solid var(--color-accent)',
                  paddingLeft: '12px',
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

      {/* How It Works — dark forest green section */}
      <section
        id="how-it-works"
        className="relative -mx-4 sm:-mx-6 px-6 sm:px-16 py-16 sm:py-24"
        data-reveal
        style={{
          backgroundColor: 'var(--color-accent-2)',
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
            Three steps to free advertising
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
          <span className="section-label">Free advertising in action</span>
          <h2
            className="mt-5"
            data-reveal
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-ink)',
            }}
          >
            Every connection is a free ad
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
            When a freelancer or local business refers their client to you, that&apos;s free advertising — no budget required.
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
              Start getting free advertising for your business today
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
              Join Sortir free and let freelancers and local businesses send new customers your way — no ad budget, no credit card, no paywall, ever.
            </p>
            <div>
              <Link
                className="btn-cta-outline"
                href="/auth"
              >
                Get free advertising now
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
