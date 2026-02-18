"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Settings, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Click-outside handler for user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    
    const fetchInitials = async (userId: string, email: string) => {
      try {
        const { data: biz } = await supabase
          .from("businesses")
          .select("name")
          .eq("owner_id", userId)
          .single();
        if (biz?.name && mounted) {
          const words = biz.name.trim().split(/\s+/);
          const initials = words
            .slice(0, 2)
            .map((w: string) => w[0]?.toUpperCase() ?? "")
            .join("");
          setUserInitials(initials || email.substring(0, 2).toUpperCase());
        } else if (mounted) {
          setUserInitials(email.substring(0, 2).toUpperCase());
        }
      } catch {
        if (mounted) setUserInitials(email.substring(0, 2).toUpperCase());
      }
    };

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          setIsLoggedIn(!!session);
          if (session?.user) {
            await fetchInitials(session.user.id, session.user.email ?? "");
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
        if (session?.user) {
          fetchInitials(session.user.id, session.user.email ?? "");
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

  const navLinkStyle = (href: string) => ({
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.02em',
    color: pathname === href ? 'var(--color-ink)' : 'var(--color-muted)',
    fontWeight: pathname === href ? 500 : undefined,
  });

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
              style={navLinkStyle("/")}
            >
              Home
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/success-stories"
              style={navLinkStyle("/success-stories")}
            >
              Success Stories
            </Link>
            <Link
              className="btn-primary ml-2"
              href="/auth"
            >
              Sign Up Free
            </Link>
          </>
        ) : (
          <>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/discover"
              style={navLinkStyle("/discover")}
            >
              Discover
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/connections"
              style={navLinkStyle("/connections")}
            >
              Connections
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/messages"
              style={navLinkStyle("/messages")}
            >
              Messages
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/dashboard"
              style={navLinkStyle("/dashboard")}
            >
              Dashboard
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/partnership-builder"
              style={navLinkStyle("/partnership-builder")}
            >
              Builder
            </Link>
            <Link
              className="px-3.5 py-2 transition-colors hover:text-[var(--color-ink)]"
              href="/refer"
              style={navLinkStyle("/refer")}
            >
              Refer &amp; Earn
            </Link>
            
            <NotificationBell />

            {/* User dropdown */}
            <div className="relative ml-2" ref={dropdownRef}>
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
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/" ? 500 : undefined }}
                  >
                    Home
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/success-stories"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/success-stories" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/success-stories" ? 500 : undefined }}
                  >
                    Success Stories
                  </Link>
                  <Link
                    className="btn-primary mt-2 w-full"
                    href="/auth"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up Free
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/discover"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/discover" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/discover" ? 500 : undefined }}
                  >
                    Discover
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/connections"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/connections" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/connections" ? 500 : undefined }}
                  >
                    Connections
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/messages"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/messages" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/messages" ? 500 : undefined }}
                  >
                    Messages
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/dashboard" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/dashboard" ? 500 : undefined }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/partnership-builder"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/partnership-builder" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/partnership-builder" ? 500 : undefined }}
                  >
                    Partnership Builder
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/refer"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/refer" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/refer" ? 500 : undefined }}
                  >
                    Refer &amp; Earn
                  </Link>
                  <Link
                    className="px-3 py-2.5 transition-colors"
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pathname === "/settings" ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: pathname === "/settings" ? 500 : undefined }}
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
