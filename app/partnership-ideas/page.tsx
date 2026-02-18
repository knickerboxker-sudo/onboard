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
    <div>
      {/* Accent top rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)" }} />

      {/* Hero */}
      <section style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}>
        <span className="section-label">Inspiration</span>
        <h1
          className="mt-5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
          }}
        >
          Partnership Ideas
        </h1>
        <p
          className="mt-6 max-w-2xl"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            lineHeight: "1.6",
            color: "var(--color-muted)",
          }}
        >
          Get inspired by real partnership examples across industries. Every business can find creative
          ways to collaborate — browse ideas, then connect with a partner to make it happen.
        </p>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Category filter */}
      <section style={{ padding: "32px 24px 0" }}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className="px-4 py-2 transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              border: "1px solid var(--color-rule)",
              color: !selectedCategory ? "var(--color-paper)" : "var(--color-muted)",
              backgroundColor: !selectedCategory ? "var(--color-ink)" : "transparent",
            }}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className="flex items-center gap-1.5 px-4 py-2 transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                border: "1px solid var(--color-rule)",
                color: selectedCategory === cat.value ? "var(--color-paper)" : "var(--color-muted)",
                backgroundColor: selectedCategory === cat.value ? "var(--color-ink)" : "transparent",
              }}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Ideas Grid */}
      <section style={{ padding: "32px 24px" }}>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea, i) => (
            <div
              key={idea.id}
              className="py-6 pr-6"
              style={{ borderTop: "1px solid var(--color-rule)", transitionDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                    color: "var(--color-muted)",
                    border: "1px solid var(--color-rule)",
                    padding: "2px 8px",
                  }}
                >
                  {idea.businessA}
                </span>
                <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>+</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                    color: "var(--color-muted)",
                    border: "1px solid var(--color-rule)",
                    padding: "2px 8px",
                  }}
                >
                  {idea.businessB}
                </span>
              </div>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "16px",
                  color: "var(--color-ink)",
                }}
              >
                {idea.idea}
              </h3>
              <p
                className="mt-1.5"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "var(--color-muted)",
                }}
              >
                {idea.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "var(--color-muted)",
                  }}
                >
                  {idea.category}
                </span>
                <Link
                  href="/discover"
                  className="flex items-center gap-1 transition-colors"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-ink)",
                  }}
                >
                  Find a partner <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Partnership Proposal Templates Section */}
      <section style={{ padding: "48px 24px" }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="section-label">Templates</span>
            <h2
              className="mt-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "24px",
                color: "var(--color-ink)",
              }}
            >
              Proposal Templates
            </h2>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--color-muted)",
              }}
            >
              Ready-to-use templates to start partnership conversations
            </p>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn-primary"
          >
            {showTemplates ? "Hide" : "View Templates"}
          </button>
        </div>

        {showTemplates && (
          <div className="mt-8 grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {PROPOSAL_TEMPLATES.map((template, i) => (
              <div
                key={template.id}
                className="py-6 pr-6"
                style={{ borderTop: "1px solid var(--color-rule)" }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "16px",
                    color: "var(--color-ink)",
                  }}
                >
                  {template.title}
                </h3>
                <p
                  className="mt-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: "var(--color-muted)",
                  }}
                >
                  {template.description}
                </p>
                <div className="mt-3">
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: "var(--color-muted)",
                    }}
                  >
                    Key Terms
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {template.terms.slice(0, 3).map((term, j) => (
                      <li
                        key={j}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          color: "var(--color-muted)",
                        }}
                      >
                        &bull; {term}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section
        className="relative -mx-4 sm:-mx-6"
        style={{ backgroundColor: "var(--color-accent)", padding: "80px 64px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontStyle: "italic",
                color: "var(--color-paper)",
                lineHeight: "1.1",
              }}
            >
              Have a partnership success story?
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "rgba(245,242,235,0.8)",
              }}
            >
              Share how your business partnership worked out. Your story could inspire other businesses
              to try something new.
            </p>
            <div>
              <Link href="/success-stories" className="btn-cta-outline">
                Share Your Story <ArrowRight className="inline h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
