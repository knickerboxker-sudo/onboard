import Link from "next/link";
import { formatDate, categoryColor, categoryLabel, truncate } from "@/src/lib/utils";

interface RecallCardProps {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: Date | string;
  companyName: string | null;
  companyNormalized?: string | null;
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
}: RecallCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs px-2 py-0.5 rounded border ${categoryColor(category)}`}
          >
            {categoryLabel(category)}
          </span>
          <span className="text-xs text-muted">{source}</span>
        </div>
        <span className="text-xs text-muted whitespace-nowrap">
          {formatDate(publishedAt)}
        </span>
      </div>
      <Link href={`/event/${id}`} className="block group">
        <h3 className="font-medium text-ink group-hover:text-accent transition-colors mb-1 leading-snug">
          {truncate(title, 120)}
        </h3>
      </Link>
      {companyName && (
        <p className="text-sm text-muted mb-1">
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
      <p className="text-sm text-muted/80 leading-relaxed">
        {truncate(summary, 180)}
      </p>
      <Link
        href={`/event/${id}`}
        className="inline-block mt-2 text-xs text-accent hover:text-accent-hover transition-colors"
      >
        View details
      </Link>
    </div>
  );
}
