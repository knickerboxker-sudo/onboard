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
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Permit Lead Generator
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 transition hover:text-gray-900 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-90">
          Sign Up
        </button>
      </div>
    </header>
  );
}
