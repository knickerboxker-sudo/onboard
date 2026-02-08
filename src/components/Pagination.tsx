"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${baseUrl}?${params.toString()}`);
  };

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded border border-border text-muted hover:text-ink hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            p === page
              ? "bg-accent text-white border-accent"
              : "border-border text-muted hover:text-ink hover:border-accent"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded border border-border text-muted hover:text-ink hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
