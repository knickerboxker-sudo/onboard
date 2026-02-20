import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessRecord } from "@/lib/types";
import ShareButton from "./ShareButton";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const supabase = createAdminClient();
    const { data: business } = await supabase
      .from("businesses")
      .select("name, description")
      .eq("id", id)
      .single();
    if (!business) return { title: "Business Not Found — Sortir" };
    return {
      title: `${business.name} — Partner on Sortir`,
      description: business.description ?? `Connect with ${business.name} on Sortir.`,
    };
  } catch {
    return { title: "Business Profile — Sortir" };
  }
}

export default async function BusinessProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "id, name, business_type, address, description, partnership_types, partnership_interest_tags, looking_for, can_offer, verified, years_in_operation, photos, city, owner_id",
    )
    .eq("id", id)
    .single();

  if (error || !business) {
    notFound();
  }

  const biz = business as BusinessRecord & { city?: string };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app";
  const profileUrl = `${appUrl}/businesses/${id}`;

  // Track profile view via admin client (fire-and-forget, no auth required)
  void supabase.from("profile_views").insert({ business_id: id });

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      {/* Accent rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)", marginBottom: "48px" }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                lineHeight: "1.1",
                color: "var(--color-ink)",
              }}
            >
              {biz.name}
            </h1>
            {biz.verified && (
              <span
                title="Verified business"
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "var(--color-paper)",
                  borderRadius: "2px",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                ✓ Verified
              </span>
            )}
          </div>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-muted)" }}
          >
            {biz.business_type}
            {biz.city ? ` · ${biz.city}` : ""}
            {biz.years_in_operation ? ` · ${biz.years_in_operation}+ years in business` : ""}
          </p>
        </div>
        <ShareButton url={profileUrl} businessName={biz.name} />
      </div>

      {/* Description */}
      {biz.description && (
        <p
          className="mb-8 text-base leading-relaxed"
          style={{ color: "var(--color-ink)", fontFamily: "var(--font-body)" }}
        >
          {biz.description}
        </p>
      )}

      {/* Partnership types */}
      {biz.partnership_types && biz.partnership_types.length > 0 && (
        <div className="mb-6">
          <h2
            className="mb-3 text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
          >
            Partnership Types
          </h2>
          <div className="flex flex-wrap gap-2">
            {biz.partnership_types.map((pt) => (
              <span
                key={pt}
                className="px-3 py-1 text-xs"
                style={{
                  border: "1px solid var(--color-rule)",
                  borderRadius: "2px",
                  fontFamily: "var(--font-body)",
                  color: "var(--color-ink)",
                  backgroundColor: "var(--color-paper-dark)",
                }}
              >
                {pt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Looking for / Can offer */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {biz.looking_for && biz.looking_for.length > 0 && (
          <div>
            <h2
              className="mb-2 text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
            >
              Looking For
            </h2>
            <ul className="space-y-1">
              {biz.looking_for.map((item) => (
                <li
                  key={item}
                  className="text-sm"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                >
                  — {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {biz.can_offer && biz.can_offer.length > 0 && (
          <div>
            <h2
              className="mb-2 text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}
            >
              Can Offer
            </h2>
            <ul className="space-y-1">
              {biz.can_offer.map((item) => (
                <li
                  key={item}
                  className="text-sm"
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
                >
                  — {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)", marginBottom: "32px" }} />

      {/* CTA */}
      <div className="text-center">
        <p
          className="mb-4 text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--color-muted)" }}
        >
          Interested in partnering with {biz.name}?
        </p>
        <Link
          href={`/auth?redirect=/connections`}
          className="btn-primary"
        >
          Connect on Sortir
        </Link>
      </div>
    </div>
  );
}
