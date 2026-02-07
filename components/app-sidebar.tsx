"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Feed", path: "feed", icon: "📋" },
  { label: "Search", path: "search", icon: "🔍" },
  { label: "Settings", path: "settings", icon: "⚙️" },
];

export function AppSidebar({
  workspaceSlug,
  workspaceName,
}: {
  workspaceSlug: string;
  workspaceName: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 shrink-0 border-r border-[#e5e7eb] bg-white h-screen sticky top-0 flex flex-col">
      <div className="px-4 py-4 border-b border-[#e5e7eb]">
        <Link href={`/app/${workspaceSlug}/feed`} className="block">
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
            sortir
          </span>
          <h2 className="text-sm font-semibold truncate mt-0.5">{workspaceName}</h2>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const href = `/app/${workspaceSlug}/${item.path}`;
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={item.path}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-[#f3f4f6] font-medium"
                  : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111]"
              )}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-[#e5e7eb]">
        <div className="text-xs text-[#6b7280] truncate mb-2">
          {session?.user?.email}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs text-[#6b7280] hover:text-[#111] transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
