"use client";

import { useState } from "react";
import Link from "next/link";
import { getPartnershipIdeasByCategory, PARTNERSHIP_IDEAS, PROPOSAL_TEMPLATES } from "@/lib/matching";
import type { PartnershipIdeaCategory } from "@/lib/matching";
import {
  ArrowRight,
  ChefHat,
  ShoppingBag,
  Wrench,
  Heart,
  Palette,
  Briefcase,
  Sparkles,
  FileText,
  Lightbulb,
} from "lucide-react";

const CATEGORIES: { value: PartnershipIdeaCategory; label: string; icon: typeof ChefHat }[] = [
  { value: "Food & Beverage", label: "Food & Beverage", icon: ChefHat },
  { value: "Retail", label: "Retail", icon: ShoppingBag },
  { value: "Services", label: "Services", icon: Wrench },
  { value: "Health & Wellness", label: "Health & Wellness", icon: Heart },
  { value: "Arts & Entertainment", label: "Arts & Entertainment", icon: Palette },
  { value: "Professional Services", label: "Professional Services", icon: Briefcase },
];

export default function PartnershipIdeasPage() {
  const [selectedCategory, setSelectedCategory] = useState<PartnershipIdeaCategory | undefined>(undefined);
  const [showTemplates, setShowTemplates] = useState(false);

  const ideas = getPartnershipIdeasByCategory(selectedCategory);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-creamsicle-50">
          <Lightbulb className="h-7 w-7 text-creamsicle-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Partnership Ideas
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-500">
          Get inspired by real partnership examples across industries. Every business can find creative
          ways to collaborate — browse ideas, then connect with a partner to make it happen.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
            !selectedCategory ? "bg-neutral-900 text-white shadow-lg" : "bg-white text-neutral-600 border border-neutral-200 shadow-sm hover:bg-neutral-50"
          }`}
        >
          All Industries
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              selectedCategory === cat.value
                ? "bg-neutral-900 text-white shadow-lg"
                : "bg-white text-neutral-600 border border-neutral-200 shadow-sm hover:bg-neutral-50"
            }`}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft border border-neutral-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-creamsicle-50 px-2.5 py-0.5 text-xs font-semibold text-creamsicle-700 border border-creamsicle-100">
                {idea.businessA}
              </span>
              <span className="text-neutral-300">+</span>
              <span className="rounded-full bg-lavender-50 px-2.5 py-0.5 text-xs font-semibold text-lavender-700 border border-lavender-100">
                {idea.businessB}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-neutral-900">{idea.idea}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{idea.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-neutral-50 px-2.5 py-0.5 text-[10px] font-medium text-neutral-500 border border-neutral-100">
                {idea.category}
              </span>
              <Link
                href="/discover"
                className="flex items-center gap-1 text-xs font-semibold text-lavender-600 transition-colors duration-200 hover:text-lavender-700"
              >
                Find a partner <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Partnership Proposal Templates Section */}
      <div className="rounded-2xl bg-gradient-to-r from-spearmint-50 to-lavender-50 p-7 border border-spearmint-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-100">
              <FileText className="h-5 w-5 text-lavender-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Proposal Templates</h2>
              <p className="text-sm text-neutral-500">Ready-to-use templates to start partnership conversations</p>
            </div>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn-muted text-xs"
          >
            {showTemplates ? "Hide" : "View Templates"}
          </button>
        </div>

        {showTemplates && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROPOSAL_TEMPLATES.map((template) => (
              <div key={template.id} className="rounded-xl bg-white p-5 shadow-sm border border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">{template.title}</h3>
                <p className="mt-1 text-xs text-neutral-500">{template.description}</p>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Key Terms</p>
                  <ul className="mt-1 space-y-0.5">
                    {template.terms.slice(0, 3).map((term, i) => (
                      <li key={i} className="text-xs text-neutral-600">&bull; {term}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Next Steps</p>
                  <ul className="mt-1 space-y-0.5">
                    {template.nextSteps.slice(0, 2).map((step, i) => (
                      <li key={i} className="text-xs text-neutral-600">{i + 1}. {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Success Story CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 px-6 py-14 text-center">
        <div className="pointer-events-none absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #f49d6e 0%, transparent 70%)" }} />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-creamsicle-500/20">
            <Sparkles className="h-6 w-6 text-creamsicle-200" />
          </div>
          <h2 className="text-xl font-bold text-white">Have a partnership success story?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-400">
            Share how your business partnership worked out. Your story could inspire other businesses
            to try something new.
          </p>
          <Link href="/success-stories" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            Share Your Story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
