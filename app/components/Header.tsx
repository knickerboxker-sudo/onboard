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
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(245,242,235,0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-rule)",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link className="flex items-center" href="/">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                color: "var(--color-ink)",
                fontWeight: 400,
              }}
            >
              Sortir
            </span>
            <span
              style={{
                color: "var(--color-accent)",
                marginLeft: "2px",
                fontFamily: "var(--font-display)",
                fontSize: "18px",
              }}
            >
              ·
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {!isLoggedIn ? (
            <>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/"
              >
                Home
              </Link>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/coming-soon"
              >
                Launch Progress
              </Link>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/success-stories"
              >
                Success Stories
              </Link>
              <Link
                className="ml-2"
                href="/join"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "2px",
                  background: "var(--color-ink)",
                  color: "var(--color-paper)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-ink)";
                }}
              >
                Join Waitlist
              </Link>
            </>
          ) : (
            <>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/discover"
              >
                Discover
              </Link>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/connections"
              >
                Connections
              </Link>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/messages"
              >
                Messages
              </Link>
              <Link
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  color: "var(--color-muted)",
                  padding: "6px 12px",
                  transition: "color 0.2s",
                }}
                className="hover:text-[var(--color-ink)]"
                href="/dashboard"
              >
                Dashboard
              </Link>

              {/* User dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    color: "var(--color-muted)",
                    transition: "color 0.2s",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  type="button"
                  aria-label="User menu"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "1px solid var(--color-rule)",
                      background: "var(--color-paper-dark)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-ink)",
                    }}
                  >
                    {userInitials || <User style={{ width: "14px", height: "14px" }} />}
                  </div>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        zIndex: 50,
                        marginTop: "8px",
                        width: "180px",
                        border: "1px solid var(--color-rule)",
                        background: "var(--color-paper)",
                        boxShadow: "0 4px 16px rgba(13,13,13,0.08)",
                      }}
                    >
                      <div style={{ padding: "8px" }}>
                        <Link
                          href="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            fontSize: "13px",
                            fontFamily: "var(--font-body)",
                            color: "var(--color-ink)",
                            transition: "background 0.15s",
                            borderRadius: "2px",
                          }}
                          className="hover:bg-[var(--color-paper-dark)]"
                        >
                          <Settings style={{ width: "14px", height: "14px" }} />
                          Settings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            fontSize: "13px",
                            fontFamily: "var(--font-body)",
                            color: "var(--color-accent)",
                            transition: "background 0.15s",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "2px",
                          }}
                          className="hover:bg-[var(--color-paper-dark)]"
                          type="button"
                        >
                          <LogOut style={{ width: "14px", height: "14px" }} />
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
          style={{
            padding: "8px",
            color: "var(--color-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
          aria-label="Toggle menu"
          className="sm:hidden"
        >
          {menuOpen ? <X style={{ width: "20px", height: "20px" }} /> : <Menu style={{ width: "20px", height: "20px" }} />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderTop: "1px solid var(--color-rule)",
              background: "var(--color-paper)",
              padding: "16px 24px",
            }}
            className="sm:hidden"
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {!isLoggedIn ? (
                <>
                  <Link
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--color-ink)",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-rule)",
                    }}
                    href="/"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--color-ink)",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-rule)",
                    }}
                    href="/coming-soon"
                    onClick={() => setMenuOpen(false)}
                  >
                    Launch Progress
                  </Link>
                  <Link
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--color-ink)",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-rule)",
                    }}
                    href="/success-stories"
                    onClick={() => setMenuOpen(false)}
                  >
                    Success Stories
                  </Link>
                  <Link
                    href="/join"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "12px",
                      borderRadius: "2px",
                      background: "var(--color-ink)",
                      color: "var(--color-paper)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "10px 16px",
                    }}
                  >
                    Join Waitlist
                  </Link>
                </>
              ) : (
                <>
                  {["Discover", "Connections", "Messages", "Dashboard", "Settings"].map((label, i, arr) => (
                    <Link
                      key={label}
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "14px",
                        color: "var(--color-ink)",
                        padding: "10px 0",
                        borderBottom: i < arr.length - 1 ? "1px solid var(--color-rule)" : "none",
                      }}
                      href={`/${label.toLowerCase()}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "12px",
                      padding: "10px 16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-accent)",
                      background: "transparent",
                      border: "1px solid var(--color-accent)",
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    <LogOut style={{ width: "14px", height: "14px" }} />
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
