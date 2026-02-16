"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <header className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-soft backdrop-blur-xl">
      <Link className="flex items-center gap-2.5" href="/">
        <Image
          src="/sortir-logo.png"
          alt="Sortir"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-contain"
          priority
        />
        <span className="text-lg font-semibold tracking-tight text-slate-900">Sortir</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        {isLoggedIn && (
          <>
            <Link className="hidden rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 sm:inline-flex" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hidden rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 sm:inline-flex" href="/matches">
              Matches
            </Link>
            <Link className="hidden rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 sm:inline-flex" href="/messages">
              Messages
            </Link>
          </>
        )}
        {!isLoggedIn && (
          <Link className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" href="/auth">
            Sign in
          </Link>
        )}
        <Link className="btn-primary" href={isLoggedIn ? "/swipe" : "/auth"}>
          {isLoggedIn ? "Start matching" : "Get started"}
        </Link>
      </nav>
    </header>
  );
}
