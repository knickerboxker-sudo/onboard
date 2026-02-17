import Link from "next/link";
import { successStories } from "@/lib/success-stories";

export const metadata = {
  title: "Success Stories | Sortir",
  description:
    "Partnership success stories from small businesses using Sortir to grow together.",
};

export default function SuccessStoriesPage() {
  return (
    <section className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <span className="hero-badge">Partnership Results</span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Success Stories
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-neutral-500">
          We&apos;re just getting started! Once Sortir launches and businesses
          begin partnering, their stories will be featured here.
        </p>
      </div>

      {/* Stories Grid — shown only when real stories exist */}
      {successStories.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {successStories.map((story) => (
            <article
              key={story.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
            >
              {/* Partnership type badge */}
              <span className="inline-flex w-fit items-center rounded-full border border-lavender-100 bg-lavender-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-lavender-700">
                {story.partnershipType}
              </span>

              {/* Business names */}
              <h2 className="mt-4 text-lg font-bold text-neutral-900">
                {story.businessA}{" "}
                <span className="font-normal text-neutral-400">&amp;</span>{" "}
                {story.businessB}
              </h2>

              {/* Key metric */}
              <p className="mt-2 text-2xl font-extrabold bg-gradient-to-r from-spearmint-600 to-spearmint-500 bg-clip-text text-transparent">
                {story.keyMetric}
              </p>

              {/* Testimonial quote */}
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500">
                &ldquo;{story.testimonialQuote}&rdquo;
              </blockquote>

              {/* Timeframe */}
              <p className="mt-4 text-xs font-medium text-neutral-400">
                Results achieved in {story.timeframe}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl bg-neutral-900 px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-lavender-600/10 via-transparent to-spearmint-500/10" />
        <div className="relative">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Be One of Our First Success Stories
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-neutral-400">
            Join the waitlist and be among the first businesses to partner through
            Sortir when we launch.
          </p>
          <Link
            href="/join"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
