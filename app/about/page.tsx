import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          About Sortir
        </h1>
        <p className="mt-2 text-neutral-500">
          Connecting local businesses for stronger partnerships
        </p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <p className="text-sm leading-relaxed text-neutral-600">
          Sortir is a business partnership discovery platform where businesses
          can browse and connect with partnership opportunities in their local
          area. We help small businesses and solo entrepreneurs form real
          partnerships to grow together.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Our mission is to make it easy for local businesses to find
          complementary partners, structure fair deals, and build cooperative
          networks that help every small business on the block thrive.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          Currently launching in the Ann Arbor Area with city-by-city expansion
          planned across Michigan and beyond.
        </p>
      </div>
      <Link href="/join" className="btn-primary inline-flex items-center gap-2">
        Join the Waitlist
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
