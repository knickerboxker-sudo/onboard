import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edgar Per Employee — SEC Filing Data",
  description:
    "Public SEC filing data. Search a company and see buybacks, dividends, and per-employee metrics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-border bg-base shadow-header">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold text-ink">
              edgar-per-employee
            </a>
            <div className="flex gap-4 text-sm text-muted">
              <a href="/" className="hover:text-ink">
                Search
              </a>
              <a href="/methodology" className="hover:text-ink">
                Methodology
              </a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          <p>
            Data sourced from{" "}
            <a
              href="https://www.sec.gov/edgar"
              className="underline hover:text-ink"
              target="_blank"
              rel="noopener noreferrer"
            >
              SEC EDGAR
            </a>
            . Not investment advice.
          </p>
        </footer>
      </body>
    </html>
  );
}
