import Link from "next/link";
import { Lock, ArrowRight, Users, Handshake, BarChart3 } from "lucide-react";

const previewFeatures = [
  {
    icon: Users,
    title: "Discover Local Partners",
    description:
      "Browse and connect with complementary businesses in your area through our intelligent matching system.",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    icon: Handshake,
    title: "Partnership Builder",
    description:
      "Structure fair partnerships with our equity assessment tool — from revenue splits to commission models.",
    iconBg: "bg-lavender-50",
    iconColor: "text-lavender-600",
  },
  {
    icon: BarChart3,
    title: "Track Results",
    description:
      "Measure the ROI of your partnerships with built-in analytics tracking revenue and customer growth.",
    iconBg: "bg-spearmint-50",
    iconColor: "text-spearmint-600",
  },
];

export default function DashboardPreviewPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Lock className="h-6 w-6 text-neutral-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Dashboard Preview
        </h1>
        <p className="mt-3 text-neutral-500">
          Here&apos;s what you&apos;ll get access to when your city launches.
        </p>
      </div>

      {/* Feature previews */}
      <div className="space-y-4">
        {previewFeatures.map((feature) => (
          <div
            key={feature.title}
            className="group flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Partnership board teaser */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft">
        <h2 className="mb-5 font-semibold text-neutral-900">
          Partnership Opportunity Board
        </h2>
        <div className="space-y-3">
          {[
            {
              title: "Cross-Promotion: Coffee + Bookshop",
              type: "Cross-promotion",
              status: "Open",
            },
            {
              title: "Holiday Pop-up: Local Makers",
              type: "Event collaboration",
              status: "3 interested",
            },
            {
              title: "Wellness Bundle: Yoga + Meal Prep",
              type: "Bundle deal",
              status: "Matched",
            },
          ].map((opp) => (
            <div
              key={opp.title}
              className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-all duration-200 hover:bg-white hover:shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {opp.title}
                </p>
                <p className="text-xs text-neutral-500">{opp.type}</p>
              </div>
              <span className="badge-neutral">{opp.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center rounded-xl border border-dashed border-neutral-200 py-4 text-sm text-neutral-500">
          <Lock className="mr-2 h-3.5 w-3.5" />
          More opportunities available at launch
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link href="/join" className="btn-primary px-8 py-3.5 shadow-lg hover:shadow-xl">
          Join the Waitlist
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-xs text-neutral-400">
          Get early access when your city launches
        </p>
      </div>
    </div>
  );
}
