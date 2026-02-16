import Link from "next/link";
import { BarChart3, FileText, Handshake, MapPin, MessageCircle, ShieldCheck, Store, TrendingUp, Users } from "lucide-react";
import { LandingAnimations } from "./components/LandingAnimations";

const features = [
  {
    icon: Store,
    title: "Build your business profile",
    description: "Create a rich profile with your products, services, social links, and partnership preferences to attract the right collaborators.",
  },
  {
    icon: MapPin,
    title: "Discover local partners",
    description: "Find complementary businesses in your city using location-based matching and swipe through potential partners.",
  },
  {
    icon: Users,
    title: "Match & connect",
    description: "When both businesses express interest, a mutual match is created instantly so you can start collaborating right away.",
  },
  {
    icon: MessageCircle,
    title: "Message your matches",
    description: "Chat directly with matched partners to discuss cross-promotion, product bundles, and collaboration opportunities.",
  },
  {
    icon: Handshake,
    title: "Partnership builder",
    description: "Use our equity assessment tool to structure fair deals — from revenue splits to commission models and performance benchmarks.",
  },
  {
    icon: TrendingUp,
    title: "Grow together",
    description: "Sell each other's products in-store, promote on each other's social media, and create collaboration products and services.",
  },
  {
    icon: ShieldCheck,
    title: "Verified businesses",
    description: "Earn trust badges through verification — business license, storefront photos, and successful partnership track record.",
  },
  {
    icon: BarChart3,
    title: "Track partnership ROI",
    description: "Measure the real value of your partnerships with built-in ROI tracking — revenue generated, customers acquired, and performance benchmarks.",
  },
  {
    icon: FileText,
    title: "Ready-to-use templates",
    description: "Get started quickly with pre-built agreement templates for consignment, commission splits, cross-promotion, and event collaborations.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Set up your business profile with products, services, and partnership preferences in minutes.",
  },
  {
    number: "02",
    title: "Discover & swipe",
    description: "Browse nearby complementary businesses and swipe right on potential partners you'd like to work with.",
  },
  {
    number: "03",
    title: "Match & collaborate",
    description: "When both businesses swipe right, you match — then chat, build agreements, and start growing together.",
  },
];

export default function Home() {
  return (
    <LandingAnimations>
      {/* Hero Section */}
      <section className="glass rounded-3xl p-6 sm:p-10">
        <p className="mb-3 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
          Connect · Collaborate · Promote
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Small businesses grow stronger&nbsp;together.
        </h1>
        <p className="max-w-2xl text-slate-600">
          Sortir helps small businesses and solo entrepreneurs form real partnerships — sell each other&apos;s products, cross-promote locally, and build cooperative networks that compete with the big guys.
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="btn-primary" href="/auth">
            Get started free
          </Link>
          <Link className="btn-muted" href="/swipe">
            Preview swipe stack
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            className="glass group rounded-2xl p-5 transition-shadow duration-200 hover:shadow-card-hover"
            key={feature.title}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors duration-200 group-hover:bg-sky-100">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* How It Works Section */}
      <section className="glass rounded-3xl p-6 sm:p-10">
        <p className="mb-1 text-sm font-medium uppercase tracking-[0.15em] text-sky-700">How it works</p>
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Three steps to your first partnership</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="text-2xl font-bold text-sky-600/30">{step.number}</span>
              <h3 className="mt-2 text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <Link className="btn-primary" href="/auth">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Partnership Stories */}
      <section className="glass rounded-3xl p-6 sm:p-10">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Partnership stories</h2>
        <p className="mt-2 text-sm text-slate-600">
          Real collaborations between local businesses — a coffee shop partnering with a bakery, a gym teaming up with a meal-prep service. Your story could be next.
        </p>
        <div className="mt-5 rounded-xl border border-white/70 bg-[rgb(247,247,242)] px-6 py-8 text-center text-sm text-slate-500">
          Partnership stories will appear here as businesses complete collaborations. Be one of the first!
        </div>
        <div className="mt-6">
          <Link className="btn-primary" href="/auth">
            Start your first partnership
          </Link>
        </div>
      </section>
    </LandingAnimations>
  );
}
