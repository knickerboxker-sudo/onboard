import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#e5e7eb] px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">sortir</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-sm px-4 py-2 border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-[#111] text-white rounded-md hover:bg-[#333] transition-colors"
          >
            Create workspace
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <Image
            src="/sortir-logo.png"
            alt="sortir logo"
            width={180}
            height={180}
            className="mx-auto"
            priority
          />
          <h1 className="text-3xl font-semibold tracking-tight leading-tight">
            A calm internal feed for your team
          </h1>
          <p className="text-[#6b7280] text-base leading-relaxed">
            sortir is a lightweight, pull-based Q&A board and update feed for
            small teams. No real-time noise. Check it when you want.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/signup"
              className="text-sm px-5 py-2.5 bg-[#111] text-white rounded-md hover:bg-[#333] transition-colors"
            >
              Create workspace
            </Link>
            <Link
              href="/join"
              className="text-sm px-5 py-2.5 border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] transition-colors"
            >
              Join workspace
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#e5e7eb] px-6 py-4 text-center text-xs text-[#6b7280]">
        sortir &mdash; built for small teams
      </footer>
    </div>
  );
}
