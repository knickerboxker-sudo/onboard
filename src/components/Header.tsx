import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-header">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/sortir-logo.png"
            alt="sortir"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="font-bold text-lg tracking-tight text-ink">sortir</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/search"
            className="text-sm font-medium text-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-highlight transition-all"
          >
            Search
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted hover:text-ink px-3 py-2 rounded-lg hover:bg-highlight transition-all"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
