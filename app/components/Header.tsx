"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Menu, X, Settings, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          setIsLoggedIn(!!session);
          if (session?.user?.email) {
            const initials = session.user.email.substring(0, 2).toUpperCase();
            setUserInitials(initials);
          }
        }
      } catch {
        // Supabase env vars may be missing in dev; treat as logged out
      }
    };
    
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsLoggedIn(!!session);
        if (session?.user?.email) {
          const initials = session.user.email.substring(0, 2).toUpperCase();
          setUserInitials(initials);
        } else {
          setUserInitials("");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className="relative z-50 mb-8 flex items-center justify-between gap-3 rounded-2xl border border-neutral-200/60 bg-white/90 px-5 py-3 shadow-soft backdrop-blur-xl">
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
      <nav className="hidden items-center gap-0.5 text-sm sm:flex">
        {!isLoggedIn ? (
          <>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/">
              Home
            </Link>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/coming-soon">
              Launch Progress
            </Link>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/success-stories">
              Success Stories
            </Link>
            <Link
              className="btn-primary ml-2"
              href="/join"
            >
              Join Waitlist
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : (
          <>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/discover">
              Discover
            </Link>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/connections">
              Connections
            </Link>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/messages">
              Messages
            </Link>
            <Link className="rounded-xl px-3.5 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" href="/dashboard">
              Dashboard
            </Link>
            
            {/* User dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                type="button"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-lavender-100 text-xs font-semibold text-lavender-700">
                  {userInitials || <User className="h-4 w-4" />}
                </div>
              </button>
              
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-neutral-100 bg-white/95 shadow-elevated backdrop-blur-xl"
                  >
                    <div className="p-2">
                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
                        type="button"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </nav>

      {/* Mobile menu button */}
      <button
        className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 sm:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-neutral-100 bg-white/95 p-4 shadow-elevated backdrop-blur-xl sm:hidden"
          >
            <nav className="flex flex-col gap-1">
              {!isLoggedIn ? (
                <>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/" onClick={() => setMenuOpen(false)}>
                    Home
                  </Link>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/coming-soon" onClick={() => setMenuOpen(false)}>
                    Launch Progress
                  </Link>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/success-stories" onClick={() => setMenuOpen(false)}>
                    Success Stories
                  </Link>
                  <Link
                    className="btn-primary mt-2 w-full"
                    href="/join"
                    onClick={() => setMenuOpen(false)}
                  >
                    Join Waitlist
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/discover" onClick={() => setMenuOpen(false)}>
                    Discover
                  </Link>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/connections" onClick={() => setMenuOpen(false)}>
                    Connections
                  </Link>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/messages" onClick={() => setMenuOpen(false)}>
                    Messages
                  </Link>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link className="rounded-xl px-3 py-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-100" href="/settings" onClick={() => setMenuOpen(false)}>
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 font-medium text-red-700 transition-colors hover:bg-red-100"
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
