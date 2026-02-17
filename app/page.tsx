import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Handshake,
  Lightbulb,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Store,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { LandingAnimations } from "./components/LandingAnimations";

const features = [
  {
    icon: Store,
    title: "Build your business profile",
    description:
      "Create a rich profile with your products, services, social links, and partnership preferences to attract the right collaborators.",
    gradient: "from-lavender-500/10 to-lavender-600/5",
    iconColor: "text-lavender-600",
    borderAccent: "group-hover:border-lavender-200",
  },
  {
    icon: MapPin,
    title: "Discover local partners",
    description:
      "Find complementary businesses in your city using location-based search and browse through potential partners.",
    gradient: "from-spearmint-500/10 to-spearmint-600/5",
    iconColor: "text-spearmint-700",
    borderAccent: "group-hover:border-spearmint-200",
  },
  {
    icon: Users,
    title: "Connect & collaborate",
    description:
      "Send connection requests to businesses you'd like to partner with and start collaborating right away.",
    gradient: "from-creamsicle-500/10 to-creamsicle-600/5",
    iconColor: "text-creamsicle-700",
    borderAccent: "group-hover:border-creamsicle-200",
  },
  {
    icon: MessageCircle,
    title: "Message your matches",
    description:
      "Chat directly with matched partners to discuss cross-promotion, product bundles, and collaboration opportunities.",
    gradient: "from-brand-500/10 to-brand-600/5",
    iconColor: "text-brand-600",
    borderAccent: "group-hover:border-brand-200",
  },
  {
    icon: Handshake,
    title: "Partnership builder",
    description:
      "Use our equity assessment tool to structure fair deals — from revenue splits to commission models and performance benchmarks.",
    gradient: "from-lavender-500/10 to-spearmint-500/5",
    iconColor: "text-lavender-600",
    borderAccent: "group-hover:border-lavender-200",
  },
  {
    icon: TrendingUp,
    title: "Grow together",
    description:
      "Sell each other's products in-store, promote on each other's social media, and create collaboration products and services.",
    gradient: "from-spearmint-500/10 to-brand-500/5",
    iconColor: "text-spearmint-700",
    borderAccent: "group-hover:border-spearmint-200",
  },
  {
    icon: ShieldCheck,
    title: "Verified businesses",
    description:
      "Earn trust badges through verification — business license, storefront photos, and successful partnership track record.",
    gradient: "from-creamsicle-500/10 to-creamsicle-600/5",
    iconColor: "text-creamsicle-700",
    borderAccent: "group-hover:border-creamsicle-200",
  },
  {
    icon: BarChart3,
    title: "Track partnership ROI",
    description:
      "Measure the real value of your partnerships with built-in ROI tracking — revenue generated, customers acquired, and performance benchmarks.",
    gradient: "from-brand-500/10 to-lavender-500/5",
    iconColor: "text-brand-600",
    borderAccent: "group-hover:border-brand-200",
  },
  {
    icon: FileText,
    title: "Ready-to-use templates",
    description:
      "Get started quickly with pre-built agreement templates for consignment, commission splits, cross-promotion, and event collaborations.",
    gradient: "from-creamsicle-500/10 to-lavender-500/5",
    iconColor: "text-creamsicle-700",
    borderAccent: "group-hover:border-creamsicle-200",
  },
];

const partnershipExamples = [
  { businesses: "Gym + Meal Prep Service", result: "Member nutrition package", accent: "lavender" },
  { businesses: "Bookstore + Coffee Shop", result: "Reading events with refreshments", accent: "spearmint" },
  { businesses: "Salon + Boutique", result: "Style makeover packages", accent: "creamsicle" },
  { businesses: "Auto Shop + Car Wash", result: "Full service maintenance deal", accent: "lavender" },
  { businesses: "Photography + Event Planner", result: "Event media packages", accent: "spearmint" },
  { businesses: "Accountant + Attorney", result: "Business startup bundle", accent: "creamsicle" },
];

const accentColors: Record<string, string> = {
  lavender: "bg-lavender-500",
  spearmint: "bg-spearmint-500",
  creamsicle: "bg-creamsicle-500",
};

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Set up your business profile with products, services, and partnership preferences in minutes.",
    icon: Store,
  },
  {
    number: "02",
    title: "Discover & connect",
    description:
      "Browse nearby complementary businesses and send connection requests to potential partners you'd like to work with.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Collaborate & grow",
    description:
      "Once connected, chat, build agreements, and start growing together through smart partnerships.",
    icon: Handshake,
  },
];

const credibilitySignals = [
  "Brand-safe partner matching",
  "Collaboration ideas for local businesses",
  "ROI tracking from day one",
];

export default function Home() {
  return (
    <LandingAnimations>
      {/* Hero Section */}
      <section className="relative px-6 py-20 sm:px-12 sm:py-32">
        {/* Dot grid background */}
        <div className="pointer-events-none absolute inset-0 bg-dot-pattern bg-dot-sm opacity-[0.25]" />
        {/* Sortir signature gradient orbs */}
        <div className="pointer-events-none absolute -top-20 right-0 h-[500px] w-[500px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />

        <div className="relative max-w-3xl">
          <div className="section-label mb-8">
            <MapPin className="h-3.5 w-3.5" />
            Ann Arbor Area Pre-Launch
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.5rem]">
            Your neighborhood businesses,{" "}
            <span className="sortir-gradient-text">
              stronger together.
            </span>
          </h1>
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-neutral-500">
            Sortir helps you find your perfect local partner — cross-promote,
            share customers, and build cooperative networks that help every
            small business on the block thrive.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn-primary px-8 py-4 text-[15px] shadow-lg hover:shadow-xl"
              href="/join"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="btn-secondary px-8 py-4 text-[15px]"
              href="/coming-soon"
            >
              See launch progress
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {credibilitySignals.map((signal) => (
              <span
                key={signal}
                className="inline-flex items-center rounded-full border border-neutral-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-neutral-600 shadow-sm backdrop-blur-sm"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sortir signature divider */}
      <div className="sortir-divider" />

      {/* Feature Cards */}
      <section>
        <div className="mb-14 text-center">
          <span className="section-label">
            <Zap className="h-3.5 w-3.5" />
            Features
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Everything you need to grow through partnerships
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-500">
            From discovering partners to tracking results, Sortir gives you the
            complete toolkit for building successful business collaborations.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              className={`group sortir-card border ${feature.borderAccent} p-6`}
              key={feature.title}
            >
              {/* Hover gradient overlay */}
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              <div className="relative">
                <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-[15px] font-semibold text-neutral-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sortir divider */}
      <div className="sortir-divider" />

      {/* How It Works Section */}
      <section id="how-it-works" className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-soft sm:p-16">
        {/* Subtle brand glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />

        <div className="relative text-center">
          <span className="section-label">
            <Zap className="h-3.5 w-3.5" />
            How it works
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Three steps to your first partnership
          </h2>
        </div>
        <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[calc(50%+2.5rem)] top-8 hidden h-px w-[calc(100%-5rem)] sm:block" style={{ background: "linear-gradient(90deg, #d4d4d8, transparent)" }} />
              )}
              <div className="mx-auto mb-6 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <step.icon className="h-9 w-9 text-spearmint-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-lavender-500">
                Step {step.number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link className="btn-primary px-8 py-3.5 shadow-lg hover:shadow-xl" href="/join">
            Join the waitlist
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Sortir divider */}
      <div className="sortir-divider" />

      {/* Featured Partnership Ideas */}
      <section>
        <div className="mb-14 text-center">
          <span className="section-label">
            <Lightbulb className="h-3.5 w-3.5" />
            Partnership ideas
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Every business can partner
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-500">
            From coffee shops to accountants — there&apos;s a partnership waiting for every type of business.
            Try something new, see what works.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partnershipExamples.map((ex) => (
            <div key={ex.businesses} className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white px-6 py-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
              {/* Accent line */}
              <div className={`absolute top-0 left-0 h-full w-[3px] ${accentColors[ex.accent]} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              <p className="text-sm font-semibold text-neutral-900">{ex.businesses}</p>
              <p className="mt-1.5 text-xs text-neutral-500">{ex.result}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link className="text-sm font-semibold text-lavender-600 transition-colors duration-200 hover:text-lavender-700" href="/partnership-ideas">
            See all partnership ideas <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-24 text-center sm:px-12">
        {/* Brand gradient accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-[400px] w-[400px] rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #34d399 0%, transparent 70%)" }} />

        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Ready to find your perfect{" "}
            <br className="hidden sm:block" />
            business partner?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-neutral-400">
            Join the waitlist for your city and be the first to know when Sortir
            launches. It&apos;s free to get started.
          </p>
          <div className="mt-10">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              href="/join"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-xs text-neutral-500">
            No credit card required &middot; Free forever for basic features
          </p>
        </div>
      </section>
    </LandingAnimations>
  );
}
