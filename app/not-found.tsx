import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-neutral-100 bg-white p-10 text-center shadow-soft">
        <p className="text-6xl font-extrabold sortir-gradient-text">404</p>
        <h1 className="mt-4 text-xl font-semibold text-neutral-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
