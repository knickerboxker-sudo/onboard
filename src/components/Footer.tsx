import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink">sortir</span>
            <span className="text-sm text-muted">· Unified Recall Search</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/search"
              className="text-muted hover:text-ink transition-colors"
            >
              Search
            </Link>
            <Link
              href="/about"
              className="text-muted hover:text-ink transition-colors"
            >
              About
            </Link>
            <Link
              href="/feedback"
              className="text-muted hover:text-ink transition-colors"
            >
              Feedback
            </Link>
          </nav>
        </div>
        <div className="text-center text-xs text-muted/70 space-y-1">
          <p>
            sortir aggregates publicly available recall data from NHTSA, CPSC,
            USDA FSIS, FDA, EPA, and USCG. This site is not affiliated with any
            government agency.
          </p>
          <p>Data is provided for informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
