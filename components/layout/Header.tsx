"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/permits", label: "Permits" },
  { href: "/alerts", label: "Alerts" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < 80 || currentY < lastY);
      setLastY(currentY);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur"
      style={{ transform: visible ? "translateY(0)" : "translateY(-80px)", transition: "transform 0.3s ease-in-out" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Permit Lead Generator"
          title="Permit Lead Generator"
          className="truncate text-base font-semibold text-gray-900 sm:text-lg"
        >
          Permit Lead Generator
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center py-2 text-sm text-gray-600 transition hover:text-gray-900 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="min-h-11 rounded-md bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-90">
            Sign Up
          </button>
          <button
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-gray-300 text-gray-700 md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-gray-200 bg-white p-3 md:hidden">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
