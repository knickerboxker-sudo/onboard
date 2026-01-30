import Link from "next/link";
import { ReactNode } from "react";
import { MessageSquareText, NotebookText, Bell, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chat", label: "Chat", icon: MessageSquareText },
  { href: "/memories", label: "Memories", icon: NotebookText },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function AppShell({ children }: { children: ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "OnboardAI";
  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="sticky top-0 z-40 border-b border-border bg-base/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
              OA
            </div>
            <div>
              <p className="text-sm font-semibold">{appName}</p>
              <p className="text-xs text-muted">Connected</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
            <UserCircle className="h-4 w-4" />
            Profile
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-4 px-4 py-4">
        <aside className="hidden w-56 flex-col gap-2 rounded-2xl border border-border bg-white p-3 shadow-sm md:flex">
          <p className="text-xs font-semibold uppercase text-muted">Workspace</p>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-highlight hover:text-ink"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </aside>

        <main className="flex-1">{children}</main>
      </div>

      <nav className="fixed bottom-3 left-1/2 z-50 flex w-[92%] -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-white px-4 py-2 shadow-soft md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-[11px] font-medium text-muted"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
