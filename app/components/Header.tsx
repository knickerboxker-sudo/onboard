"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) setIsLoggedIn(!!session);
      } catch {
        // Supabase env vars may be missing in dev; treat as logged out
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="relative mb-8 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <Link className="flex items-center gap-2.5" href="/">
          <Image
            src="/sortir-logo.png"
            alt="Sortir"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-contain"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-neutral-900">Sortir</span>
        </Link>
        <span className="badge-primary hidden sm:inline-flex">Pre-Launch</span>
      </div>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 text-sm sm:flex">
        <Link className="rounded-lg px-3 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/">
          Home
        </Link>
        <Link className="rounded-lg px-3 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/coming-soon">
          Launch Progress
        </Link>
        <Link className="rounded-lg px-3 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/success-stories">
          Success Stories
        </Link>
        {isLoggedIn && (
          <>
            <Link className="rounded-lg px-3 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/dashboard">
              Dashboard
            </Link>
          </>
        )}
        <Link
          className="btn-primary ml-2"
          href="/join"
        >
          Join Waitlist
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* Mobile menu button */}
      <button
        className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 sm:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg sm:hidden">
          <nav className="flex flex-col gap-1">
            <Link className="rounded-lg px-3 py-2.5 font-medium text-neutral-700 hover:bg-neutral-100" href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link className="rounded-lg px-3 py-2.5 font-medium text-neutral-700 hover:bg-neutral-100" href="/coming-soon" onClick={() => setMenuOpen(false)}>
              Launch Progress
            </Link>
            <Link className="rounded-lg px-3 py-2.5 font-medium text-neutral-700 hover:bg-neutral-100" href="/success-stories" onClick={() => setMenuOpen(false)}>
              Success Stories
            </Link>
            {isLoggedIn && (
              <Link className="rounded-lg px-3 py-2.5 font-medium text-neutral-700 hover:bg-neutral-100" href="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            <Link
              className="btn-primary mt-2 w-full"
              href="/join"
              onClick={() => setMenuOpen(false)}
            >
              Join Waitlist
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
