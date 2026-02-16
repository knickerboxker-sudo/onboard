import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Handshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
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
      "Find complementary businesses in your city using location-based matching and swipe through potential partners.",
  },
  {
    icon: Users,
    title: "Match & connect",
    description:
      "When both businesses express interest, a mutual match is created instantly so you can start collaborating right away.",
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
    title: "Discover & swipe",
    description:
      "Browse nearby complementary businesses and swipe right on potential partners you'd like to work with.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Match & collaborate",
    description:
      "When both businesses swipe right, you match — then chat, build agreements, and start growing together.",
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-16 sm:px-12 sm:py-24">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-sky-400/20 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Connect • Collaborate • Promote
          </div>
          <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Small businesses grow{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              stronger together.
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300">
            Sortir helps small businesses and solo entrepreneurs form real
            partnerships — sell each other&apos;s products, cross-promote
            locally, and build cooperative networks that compete with the big
            guys.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
              href="/auth"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-6 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              href="/swipe"
            >
              Preview swipe stack
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-slate-700/50 pt-10 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <div className="mb-10 text-center">
          <span className="section-label">
            <Zap className="h-3.5 w-3.5" />
            Features
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything you need to grow through partnerships
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            From discovering partners to tracking results, Sortir gives you the
            complete toolkit for building successful business collaborations.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              className="glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              key={feature.title}
            >
              <div className="feature-icon-bg mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 ring-1 ring-sky-100/50 sm:p-12">
        <div className="text-center">
          <span className="section-label">
            <Sparkles className="h-3.5 w-3.5" />
            How it works
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Three steps to your first partnership
          </h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-sky-300 to-sky-100 sm:block" />
              )}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
                <step.icon className="h-7 w-7 text-sky-600" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
                Step {step.number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link className="btn-primary" href="/auth">
            Create your free account
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
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Loved by local business owners
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.author} className="testimonial-card">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-900">
                  {t.author}
                </p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-16 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Ready to find your perfect{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              business partner?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Join thousands of local businesses already growing through
            partnerships on Sortir. It&apos;s free to get started.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20"
              href="/auth"
            >
              Start your first partnership
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            No credit card required • Free forever for basic features
          </p>
        </div>
      </section>
    </LandingAnimations>
  );
}
