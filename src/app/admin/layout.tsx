"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if cookie is already set
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("admin_key="));
    if (cookie) {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setError("Invalid admin key");
      }
    } catch {
      setError("Login failed");
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_key=; path=/; max-age=0";
    setAuthed(false);
    setKey("");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-accent" />
            <h1 className="text-lg font-semibold">Admin Access</h1>
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter admin key"
            className="w-full bg-highlight border border-border rounded px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:border-accent mb-3"
          />
          {error && <p className="text-danger text-sm mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

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
              <Shield size={18} className="text-accent" />
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
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-muted hover:text-ink transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {children}
      </main>
    </div>
  );
}
