import Link from "next/link";
import { successStories } from "@/lib/success-stories";

export const metadata = {
  title: "Success Stories | Sortir",
  description:
    "Real partnership success stories from small businesses using Sortir to grow together.",
};

export default function SuccessStoriesPage() {
  return (
    <section className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <span className="hero-badge">Partnership Results</span>
        <h1 className="gradient-text mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Success Stories
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
          Discover how small businesses are using Sortir to find the right
          partners and achieve measurable growth, together.
        </p>
      </div>

      {/* Stories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {successStories.map((story) => (
          <article
            key={story.id}
            className="glass flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          >
            {/* Partnership type badge */}
            <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-700">
              {story.partnershipType}
            </span>

            {/* Business names */}
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              {story.businessA}{" "}
              <span className="font-normal text-slate-400">&amp;</span>{" "}
              {story.businessB}
            </h2>

            {/* Key metric */}
            <p className="mt-2 text-2xl font-extrabold text-emerald-600">
              {story.keyMetric}
            </p>

            {/* Testimonial quote */}
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
              &ldquo;{story.testimonialQuote}&rdquo;
            </blockquote>

            {/* Timeframe */}
            <p className="mt-4 text-xs font-medium text-slate-400">
              Results achieved in {story.timeframe}
            </p>
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-900 px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to Write Your Own Success Story?
        </h2>
        <p className="max-w-lg text-slate-300">
          Join hundreds of small businesses already growing through smart
          partnerships on Sortir.
        </p>
        <Link
          href="/discover"
          className="mt-2 inline-flex rounded-xl bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          Create Your Success Story
        </Link>
      </div>
    </section>
  );
}
