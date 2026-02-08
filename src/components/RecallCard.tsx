import Link from "next/link";
import { formatDate, categoryColor, categoryLabel, truncate } from "@/src/lib/utils";
import { Calendar, Building2, ChevronRight } from "lucide-react";

interface RecallCardProps {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: Date | string;
  companyName?: string | null;
  companyNormalized?: string | null;
  returnTo?: string;
}

export function RecallCard({
  id,
  title,
  summary,
  category,
  source,
  publishedAt,
  companyName,
  companyNormalized,
  returnTo,
}: RecallCardProps) {
  const detailsHref = returnTo
    ? `/event/${id}?from=${encodeURIComponent(returnTo)}`
    : `/event/${id}`;
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover hover:border-accent/40 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${categoryColor(category)}`}
          >
            {categoryLabel(category)}
          </span>
          <span className="text-xs font-medium text-muted bg-highlight px-2 py-1 rounded-md">
            {source}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
          <Calendar size={12} />
          {formatDate(publishedAt)}
        </div>
      </div>
      <Link href={detailsHref} className="block">
        <h3 className="font-semibold text-ink group-hover:text-accent transition-colors mb-1.5 leading-snug">
          {truncate(title, 120)}
        </h3>
      </Link>
      {companyName && (
        <p className="text-sm text-muted mb-1.5 flex items-center gap-1.5">
          <Building2 size={13} className="text-muted/60 flex-shrink-0" />
          {companyNormalized ? (
            <Link
              href={`/company/${companyNormalized}`}
              className="hover:text-accent transition-colors"
            >
              {companyName}
            </Link>
          ) : (
            companyName
          )}
        </p>
      )}
      <p className="text-sm text-muted/80 leading-relaxed mb-3">
        {truncate(summary, 180)}
      </p>
      <Link
        href={detailsHref}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
      >
        View details
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
