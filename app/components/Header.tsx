"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Settings, LogOut, User } from "lucide-react";
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
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
      style={{
        backgroundColor: 'rgba(245, 242, 235, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-rule)',
      }}
    >
      <div className="flex items-center gap-3">
        <Link className="flex items-center" href="/">
          <span
            className="tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              color: 'var(--color-ink)',
            }}
          >
            Sortir
          </span>
          <span
            style={{
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              marginLeft: '1px',
            }}
          >
            ·
          </span>
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-0.5 sm:flex">
        {!isLoggedIn ? (
          <>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Home
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/coming-soon"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Launch Progress
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/success-stories"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Success Stories
            </Link>
            <Link
              className="btn-primary ml-2"
              href="/join"
            >
              Join Waitlist
            </Link>
          </>
        ) : (
          <>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/discover"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Discover
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/connections"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Connections
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/messages"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Messages
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/dashboard"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--color-muted)',
              }}
            >
              Dashboard
            </Link>
            
            {/* User dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 transition-colors"
                type="button"
                aria-label="User menu"
                style={{ color: 'var(--color-muted)' }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center text-xs font-semibold"
                  style={{
                    borderRadius: '2px',
                    backgroundColor: 'var(--color-paper-dark)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
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
                    className="absolute right-0 top-full z-50 mt-2 w-48"
                    style={{
                      borderRadius: '2px',
                      border: '1px solid var(--color-rule)',
                      backgroundColor: 'rgba(245, 242, 235, 0.95)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div className="p-2">
                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                        style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                        type="button"
                        style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}
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
        className="p-2 sm:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        type="button"
        aria-label="Toggle menu"
        style={{ color: 'var(--color-muted)' }}
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
            className="absolute left-0 right-0 top-full z-50 mt-0 p-4 sm:hidden"
            style={{
              backgroundColor: 'rgba(245, 242, 235, 0.95)',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid var(--color-rule)',
            }}
          >
            <nav className="flex flex-col gap-1">
              {!isLoggedIn ? (
                <>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Home
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/coming-soon"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Launch Progress
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/success-stories"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Success Stories
                  </Link>
                  <Link
                    className="btn-primary mt-2 w-full"
                    href="/join"
                    onClick={() => setMenuOpen(false)}
                  >
                    Join Waitlist
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/discover"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Discover
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/connections"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Connections
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/messages"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Messages
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-ink)' }}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 px-3 py-2.5"
                    type="button"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--color-accent)',
                    }}
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
