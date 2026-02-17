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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-creamsicle-100">
          <Lightbulb className="h-6 w-6 text-creamsicle-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Partnership Ideas
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
          Get inspired by real partnership examples across industries. Every business can find creative
          ways to collaborate — browse ideas, then connect with a partner to make it happen.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !selectedCategory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Industries
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100 transition-all hover:shadow-card-hover"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-creamsicle-50 px-2.5 py-0.5 text-xs font-semibold text-creamsicle-700">
                {idea.businessA}
              </span>
              <span className="text-slate-400">+</span>
              <span className="rounded-full bg-lavender-50 px-2.5 py-0.5 text-xs font-semibold text-lavender-700">
                {idea.businessB}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">{idea.idea}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{idea.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {idea.category}
              </span>
              <Link
                href="/discover"
                className="flex items-center gap-1 text-xs font-medium text-lavender-600 hover:text-lavender-700"
              >
                Find a partner <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Partnership Proposal Templates Section */}
      <div className="rounded-2xl bg-gradient-to-r from-spearmint-50 to-lavender-50 p-6 ring-1 ring-spearmint-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-100">
              <FileText className="h-5 w-5 text-lavender-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Proposal Templates</h2>
              <p className="text-sm text-slate-500">Ready-to-use templates to start partnership conversations</p>
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROPOSAL_TEMPLATES.map((template) => (
              <div key={template.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">{template.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{template.description}</p>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Key Terms</p>
                  <ul className="mt-1 space-y-0.5">
                    {template.terms.slice(0, 3).map((term, i) => (
                      <li key={i} className="text-xs text-slate-600">• {term}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Next Steps</p>
                  <ul className="mt-1 space-y-0.5">
                    {template.nextSteps.slice(0, 2).map((step, i) => (
                      <li key={i} className="text-xs text-slate-600">{i + 1}. {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Success Story CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 px-6 py-10 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-amber-400" />
        <h2 className="mt-4 text-xl font-bold text-white">Have a partnership success story?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          Share how your business partnership worked out. Your story could inspire other businesses
          to try something new.
        </p>
        <Link href="/success-stories" className="btn-primary mt-4 inline-flex bg-white text-slate-900 hover:bg-slate-100">
          Share Your Story <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
