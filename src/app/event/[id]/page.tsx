import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { ShareButton } from "@/src/components/ShareButton";
import { notFound } from "next/navigation";
import { formatDate, categoryLabel, categoryColor, sourceLabel } from "@/src/lib/utils";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Building2, Tag, Shield, Package } from "lucide-react";
import { decodeRecallId } from "@/src/lib/api-fetcher";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

/**
 * Generates dynamic metadata for recall detail pages
 */
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const event = decodeRecallId(params.id);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sortir.app";
    const url = `${baseUrl}/event/${params.id}`;
    
    // Create truncated summary for meta description (120-160 chars)
    const summary = event.summary.length > 155
      ? event.summary.substring(0, 152) + "..."
      : event.summary;
    
    const title = `${event.title} - ${categoryLabel(event.category)} Recall`;
    const description = `${summary} ${event.companyName ? `Issued by ${event.companyName}. ` : ""}Category: ${categoryLabel(event.category)}. Source: ${sourceLabel(event.source)}.`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        publishedTime: event.publishedAt,
        siteName: "sortir",
      },
    };
  } catch {
    return {
      title: "Recall Not Found - sortir",
      description: "The requested recall could not be found.",
    };
  }
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { from?: string };
}) {
  let event;
  try {
    event = decodeRecallId(params.id);
  } catch {
    notFound();
  }
  const returnTo = typeof searchParams?.from === "string" ? searchParams.from : "";
  const backHref = returnTo ? `/search?${decodeURIComponent(returnTo)}` : "/search";

  // Generate canonical URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sortir.app";
  const canonicalUrl = `${baseUrl}/event/${params.id}`;

  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: event.title,
    description: event.summary,
    category: categoryLabel(event.category),
    manufacturer: event.companyName
      ? {
          "@type": "Organization",
          name: event.companyName,
        }
      : undefined,
    url: canonicalUrl,
    recalls: {
      "@type": "ProductRecall",
      datePublished: event.publishedAt,
      description: event.summary,
      url: event.url,
      recallSource: {
        "@type": "Organization",
        name: sourceLabel(event.source),
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-base">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to search
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${categoryColor(event.category)}`}
                >
                  {categoryLabel(event.category)}
                </span>
                <span className="text-xs font-medium text-muted bg-highlight px-2 py-1 rounded-md">
                  {sourceLabel(event.source)}
                </span>
              </div>

              <h1 className="text-2xl font-bold leading-tight mb-6">{event.title}</h1>

              {/* Summary */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                  <Shield size={14} className="text-muted" />
                  What happened
                </h2>
                <p className="text-muted leading-relaxed">{event.summary}</p>
              </div>

              {/* Source link and Share */}
              <div className="flex items-center gap-3 flex-wrap">
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors bg-accent-light px-4 py-2 rounded-lg"
                  >
                    <ExternalLink size={14} />
                    View original source
                  </a>
                )}
                <ShareButton url={canonicalUrl} title={event.title} />
              </div>
            </div>
          </div>

          {/* Sidebar with quick facts */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white border border-border rounded-xl p-5 shadow-card sticky top-20">
              <h3 className="text-sm font-semibold text-ink mb-4">Quick Facts</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Published</p>
                    <p className="text-sm text-ink">{formatDate(event.publishedAt)}</p>
                  </div>
                </div>
                {event.companyName && (
                  <div className="flex items-start gap-3">
                    <Building2 size={15} className="text-muted mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">Company</p>
                      <p className="text-sm text-ink">{event.companyName}</p>
                    </div>
                  </div>
                )}
                {event.productQuantity && (
                  <div className="flex items-start gap-3">
                    <Package size={15} className="text-muted mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">Quantity Affected</p>
                      <p className="text-sm text-ink">{event.productQuantity}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Tag size={15} className="text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Category</p>
                    <p className="text-sm text-ink">{categoryLabel(event.category)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={15} className="text-muted mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Source</p>
                    <p className="text-sm text-ink">{sourceLabel(event.source)}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
