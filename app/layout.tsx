import type { Metadata } from "next";
import Link from "next/link";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PartnerSwipe",
  description: "Local business matchmaking for partnerships and cross-promotion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-8 pt-6 sm:px-6">
            <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-soft backdrop-blur-xl">
              <Link className="text-lg font-semibold tracking-tight text-slate-900" href="/">
                PartnerSwipe
              </Link>
              <nav className="flex items-center gap-2 text-sm">
                <Link className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" href="/auth">
                  Sign in
                </Link>
                <Link className="btn-primary" href="/swipe">
                  Start matching
                </Link>
              </nav>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
