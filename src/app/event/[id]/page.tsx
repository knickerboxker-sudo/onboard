import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { prisma } from "@/src/server/db/prisma";
import { notFound } from "next/navigation";
import { formatDate, categoryLabel, categoryColor, sourceLabel } from "@/src/lib/utils";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  let event;
  try {
    event = await prisma.recallEvent.findUnique({
      where: { id: params.id },
      include: { rawRecord: true },
    });
  } catch {
    notFound();
  }

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to search
        </Link>

        <div className="bg-card border border-border rounded-lg p-6">
          {/* Overview */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded border ${categoryColor(event.category)}`}
                >
                  {categoryLabel(event.category)}
                </span>
                <span className="text-xs text-muted">
                  {sourceLabel(event.source)}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
            </div>
            <span className="text-sm text-muted whitespace-nowrap">
              {formatDate(event.publishedAt)}
            </span>
          </div>

          {/* Company */}
          {event.companyName && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted mb-1">Company</h2>
              {event.companyNormalized ? (
                <Link
                  href={`/company/${event.companyNormalized}`}
                  className="text-accent hover:text-accent-hover transition-colors"
                >
                  {event.companyName}
                </Link>
              ) : (
                <p>{event.companyName}</p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-muted mb-1">
              What happened
            </h2>
            <p className="leading-relaxed">{event.summary}</p>
          </div>

          {/* Hazard */}
          {event.hazard && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted mb-1">Hazard</h2>
              <p className="leading-relaxed">{event.hazard}</p>
            </div>
          )}

          {/* Classification */}
          {event.recallClass && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted mb-1">
                Classification
              </h2>
              <p>{event.recallClass}</p>
            </div>
          )}

          {/* Brand Names */}
          {event.brandNames.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted mb-1">Brands</h2>
              <div className="flex flex-wrap gap-2">
                {event.brandNames.map((brand, i) => (
                  <span
                    key={i}
                    className="text-sm px-2 py-0.5 bg-highlight border border-border rounded"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Identifiers */}
          {event.identifiers && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted mb-1">
                Identifiers
              </h2>
              <pre className="text-sm bg-highlight border border-border rounded p-3 overflow-x-auto">
                {JSON.stringify(event.identifiers, null, 2)}
              </pre>
            </div>
          )}

          {/* Locations */}
          {event.locations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted mb-1">
                Distribution
              </h2>
              <p className="text-sm">{event.locations.join(", ")}</p>
            </div>
          )}

          {/* Source link */}
          {event.sourceUrl && (
            <div className="mb-6">
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                <ExternalLink size={14} />
                View original source
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
