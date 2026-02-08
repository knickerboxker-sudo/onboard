import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-border bg-base/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/sortir-logo.png"
            alt="sortir"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="font-semibold text-lg text-ink">sortir</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/search"
            className="text-muted hover:text-ink transition-colors"
          >
            Search
          </Link>
          <Link
            href="/about"
            className="text-muted hover:text-ink transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
