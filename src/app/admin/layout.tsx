"use client";

import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/raw", label: "Raw Records" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/entities", label: "Entities" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/sortir-logo.png" alt="sortir" width={22} height={22} className="rounded" />
              <span className="font-semibold">Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-ink transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            View Site
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {children}
      </main>
    </div>
  );
}
