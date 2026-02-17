import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Handshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
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
  },
  {
    icon: MapPin,
    title: "Discover local partners",
    description:
      "Find complementary businesses in your city using location-based search and browse through potential partners.",
  },
  {
    icon: Users,
    title: "Connect & collaborate",
    description:
      "Send connection requests to businesses you'd like to partner with and start collaborating right away.",
  },
  {
    icon: MessageCircle,
    title: "Message your matches",
    description:
      "Chat directly with matched partners to discuss cross-promotion, product bundles, and collaboration opportunities.",
  },
  {
    icon: Handshake,
    title: "Partnership builder",
    description:
      "Use our equity assessment tool to structure fair deals — from revenue splits to commission models and performance benchmarks.",
  },
  {
    icon: TrendingUp,
    title: "Grow together",
    description:
      "Sell each other's products in-store, promote on each other's social media, and create collaboration products and services.",
  },
  {
    icon: ShieldCheck,
    title: "Verified businesses",
    description:
      "Earn trust badges through verification — business license, storefront photos, and successful partnership track record.",
  },
  {
    icon: BarChart3,
    title: "Track partnership ROI",
    description:
      "Measure the real value of your partnerships with built-in ROI tracking — revenue generated, customers acquired, and performance benchmarks.",
  },
  {
    icon: FileText,
    title: "Ready-to-use templates",
    description:
      "Get started quickly with pre-built agreement templates for consignment, commission splits, cross-promotion, and event collaborations.",
  },
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

const testimonials = [
  {
    quote:
      "We partnered with a local coffee shop through Sortir and saw a 40% increase in foot traffic within the first month.",
    author: "Maria Chen",
    role: "Owner, Bloom Florals",
    rating: 5,
  },
  {
    quote:
      "The partnership builder tool made it so easy to structure a fair deal. We now cross-promote with three local businesses.",
    author: "James Wilson",
    role: "Founder, Peak Fitness Studio",
    rating: 5,
  },
  {
    quote:
      "Sortir helped us find the perfect meal-prep partner. Our members love the exclusive discounts and our retention is up 25%.",
    author: "Aisha Patel",
    role: "Co-owner, The Daily Grind Café",
    rating: 5,
  },
];

const stats = [
  { value: "2,500+", label: "Local businesses" },
  { value: "1,200+", label: "Partnerships formed" },
  { value: "35%", label: "Average revenue boost" },
  { value: "4.9/5", label: "Partner satisfaction" },
];

export default function Home() {
  return (
    <LandingAnimations>
      {/* Hero Section */}
      <section className="px-6 py-16 sm:px-12 sm:py-24">
        <div className="max-w-3xl">
          <div className="section-label mb-6">
            <MapPin className="h-3.5 w-3.5" />
            Ann Arbor Area Pre-Launch
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Your neighborhood businesses, stronger together.
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-neutral-500">
            Sortir helps you find your perfect local partner — cross-promote,
            share customers, and build cooperative networks that help every
            small business on the block thrive.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              className="btn-primary px-6 py-3.5"
              href="/join"
            >
              Join the Waitlist — Ann Arbor Area
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="btn-secondary px-6 py-3.5"
              href="/coming-soon"
            >
              See launch progress
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-neutral-200 pt-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <div className="mb-10 text-center">
          <span className="section-label">
            <Zap className="h-3.5 w-3.5" />
            Features
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Everything you need to grow through partnerships
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-500">
            From discovering partners to tracking results, Sortir gives you the
            complete toolkit for building successful business collaborations.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
              key={feature.title}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-neutral-200">
                <feature.icon className="h-5 w-5 text-neutral-700" />
              </div>
              <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-12">
        <div className="text-center">
          <span className="section-label">
            <Zap className="h-3.5 w-3.5" />
            How it works
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Three steps to your first partnership
          </h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-neutral-200 sm:block" />
              )}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
                <step.icon className="h-6 w-6 text-neutral-700" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-500">
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
        <div className="mt-10 text-center">
          <Link className="btn-primary" href="/join">
            Join the waitlist
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="mb-10 text-center">
          <span className="section-label">
            <Star className="h-3.5 w-3.5" />
            Testimonials
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Loved by local business owners
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.author} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-neutral-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 border-t border-neutral-100 pt-4">
                <p className="text-sm font-semibold text-neutral-900">
                  {t.author}
                </p>
                <p className="text-xs text-neutral-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-xl bg-neutral-900 px-6 py-16 text-center sm:px-12">
        <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          Ready to find your perfect business partner?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-neutral-400">
          Join the waitlist for your city and be the first to know when Sortir
          launches. It&apos;s free to get started.
        </p>
        <div className="mt-8">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:bg-neutral-100"
            href="/join"
          >
            Join the Waitlist
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          No credit card required • Free forever for basic features
        </p>
      </section>
    </LandingAnimations>
  );
}
