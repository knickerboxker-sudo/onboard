"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import NotificationBell from "./NotificationBell";

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
    <header className="glass mb-8 flex items-center justify-between gap-3 rounded-2xl px-5 py-3.5 shadow-soft">
      <Link className="flex items-center gap-2.5" href="/">
        <Image
          src="/sortir-logo.png"
          alt="Sortir"
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-contain"
          priority
        />
        <span className="text-lg font-bold tracking-tight text-slate-900">Sortir</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        {isLoggedIn && (
          <>
            <Link className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex" href="/matches">
              Matches
            </Link>
            <Link className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex" href="/messages">
              Messages
            </Link>
            <Link className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex" href="/settings">
              Settings
            </Link>
            <NotificationBell />
          </>
        )}
        {!isLoggedIn && (
          <Link className="rounded-lg px-3 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900" href="/auth">
            Sign in
          </Link>
        )}
        <Link
          className="group inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20"
          href={isLoggedIn ? "/swipe" : "/auth"}
        >
          {isLoggedIn ? "Start matching" : "Get started"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </header>
  );
}
