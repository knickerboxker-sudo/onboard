import Link from "next/link";
import { Handshake, MapPin, MessageCircle, Store, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Build your business profile",
    description: "Create a rich profile with your products, services, social links, and partnership preferences to attract the right collaborators.",
  },
  {
    icon: MapPin,
    title: "Discover local partners",
    description: "Find complementary businesses in your city or nearby cities using location-based matching and swipe through potential partners.",
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
];

const collaborationTypes = [
  "Sell partner products in your store",
  "Cross-promote on social media",
  "Create collaboration products & services",
  "Bundle complementary offerings",
  "Co-host local events & pop-ups",
  "Share customer referrals",
];

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="glass rounded-3xl p-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-sky-700">PartnerSwipe</p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900">Connect with local businesses. Collaborate and grow together.</h1>
        <p className="max-w-2xl text-slate-600">
          PartnerSwipe connects small business owners and solo entrepreneurs in their community to collaborate — sell each other&apos;s products, cross-promote on social media, create joint offerings, and build lasting local partnerships.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/auth">
            Get started free
          </Link>
          <Link className="btn-muted" href="/swipe">
            Preview swipe stack
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div className="glass rounded-2xl p-5" key={feature.title}>
            <feature.icon className="mb-3 h-6 w-6 text-sky-600" />
            <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-semibold text-slate-900">Ways to collaborate</h2>
        <p className="mt-2 text-sm text-slate-600">PartnerSwipe makes it easy to find the right local partners and build real business relationships.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collaborationTypes.map((item) => (
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700" key={item}>
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/auth">
            Create your free account
          </Link>
          <Link className="btn-muted" href="/dashboard">
            View dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
