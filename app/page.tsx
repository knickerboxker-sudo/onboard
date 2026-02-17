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
    accent: "from-lavender-50 to-lavender-100/50",
    iconBg: "bg-lavender-50",
    iconColor: "text-lavender-600",
  },
  {
    icon: MapPin,
    title: "Discover local partners",
    description:
      "Find complementary businesses in your city using location-based search and browse through potential partners.",
    accent: "from-spearmint-50 to-spearmint-100/50",
    iconBg: "bg-spearmint-50",
    iconColor: "text-spearmint-700",
  },
  {
    icon: Users,
    title: "Connect & collaborate",
    description:
      "Send connection requests to businesses you'd like to partner with and start collaborating right away.",
    accent: "from-creamsicle-50 to-creamsicle-100/50",
    iconBg: "bg-creamsicle-50",
    iconColor: "text-creamsicle-700",
  },
  {
    icon: MessageCircle,
    title: "Message your matches",
    description:
      "Chat directly with matched partners to discuss cross-promotion, product bundles, and collaboration opportunities.",
    accent: "from-brand-50 to-brand-100/50",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    icon: Handshake,
    title: "Partnership builder",
    description:
      "Use our equity assessment tool to structure fair deals — from revenue splits to commission models and performance benchmarks.",
    accent: "from-lavender-50 to-creamsicle-50/50",
    iconBg: "bg-lavender-50",
    iconColor: "text-lavender-600",
  },
  {
    icon: TrendingUp,
    title: "Grow together",
    description:
      "Sell each other's products in-store, promote on each other's social media, and create collaboration products and services.",
    accent: "from-spearmint-50 to-brand-50/50",
    iconBg: "bg-spearmint-50",
    iconColor: "text-spearmint-700",
  },
  {
    icon: ShieldCheck,
    title: "Verified businesses",
    description:
      "Earn trust badges through verification — business license, storefront photos, and successful partnership track record.",
    accent: "from-spearmint-50 to-spearmint-100/50",
    iconBg: "bg-spearmint-50",
    iconColor: "text-spearmint-700",
  },
  {
    icon: BarChart3,
    title: "Track partnership ROI",
    description:
      "Measure the real value of your partnerships with built-in ROI tracking — revenue generated, customers acquired, and performance benchmarks.",
    accent: "from-brand-50 to-lavender-50/50",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    icon: FileText,
    title: "Ready-to-use templates",
    description:
      "Get started quickly with pre-built agreement templates for consignment, commission splits, cross-promotion, and event collaborations.",
    accent: "from-creamsicle-50 to-lavender-50/50",
    iconBg: "bg-creamsicle-50",
    iconColor: "text-creamsicle-700",
  },
];

const partnershipExamples = [
  { businesses: "Gym + Meal Prep Service", result: "Member nutrition package" },
  { businesses: "Bookstore + Coffee Shop", result: "Reading events with refreshments" },
  { businesses: "Salon + Boutique", result: "Style makeover packages" },
  { businesses: "Auto Shop + Car Wash", result: "Full service maintenance deal" },
  { businesses: "Photography + Event Planner", result: "Event media packages" },
  { businesses: "Accountant + Attorney", result: "Business startup bundle" },
];

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

export default function Home() {
  return (
    <LandingAnimations>
      {/* Hero Section */}
      <section className="relative px-6 py-20 sm:px-12 sm:py-28">
        {/* Subtle dot grid background */}
        <div className="pointer-events-none absolute inset-0 bg-dot-pattern bg-dot-sm opacity-[0.35]" />
        <div className="relative max-w-3xl">
          <div className="section-label mb-6">
            <MapPin className="h-3.5 w-3.5" />
            Ann Arbor Area Pre-Launch
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Your neighborhood businesses,{" "}
            <span className="bg-gradient-to-r from-lavender-600 via-lavender-500 to-spearmint-500 bg-clip-text text-transparent">
              stronger together.
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-neutral-500">
            Sortir helps you find your perfect local partner — cross-promote,
            share customers, and build cooperative networks that help every
            small business on the block thrive.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn-primary px-7 py-3.5 text-base shadow-lg hover:shadow-xl"
              href="/join"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="btn-secondary px-7 py-3.5 text-base"
              href="/coming-soon"
            >
              See launch progress
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <div className="mb-12 text-center">
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
              className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
              key={feature.title}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              <div className="relative">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-105`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="overflow-hidden rounded-2xl border border-neutral-100 bg-white p-8 shadow-soft sm:p-14">
        <div className="text-center">
          <span className="section-label">
            <Zap className="h-3.5 w-3.5" />
            How it works
          </span>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Three steps to your first partnership
          </h2>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-neutral-200 to-transparent sm:block" />
              )}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-spearmint-100 bg-spearmint-50 shadow-sm transition-transform duration-300 hover:scale-105">
                <step.icon className="h-6 w-6 text-spearmint-700" />
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
        <div className="mt-12 text-center">
          <Link className="btn-primary px-7 py-3" href="/join">
            Join the waitlist
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Featured Partnership Ideas */}
      <section>
        <div className="mb-12 text-center">
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
            <div key={ex.businesses} className="group rounded-2xl border border-neutral-100 bg-white px-5 py-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
              <p className="text-sm font-semibold text-neutral-900">{ex.businesses}</p>
              <p className="mt-1.5 text-xs text-neutral-500">{ex.result}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link className="text-sm font-medium text-lavender-600 transition-colors duration-200 hover:text-lavender-700" href="/partnership-ideas">
            See all partnership ideas <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-20 text-center sm:px-12">
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lavender-600/10 via-transparent to-spearmint-500/10" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Ready to find your perfect business partner?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Join the waitlist for your city and be the first to know when Sortir
            launches. It&apos;s free to get started.
          </p>
          <div className="mt-10">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              href="/join"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-5 text-xs text-neutral-500">
            No credit card required &middot; Free forever for basic features
          </p>
        </div>
      </section>
    </LandingAnimations>
  );
}
