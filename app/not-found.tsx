import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">Permit not found</h1>
      <Link href="/permits" className="mt-3 inline-block text-blue-600 hover:underline">
        Back to permits
      </Link>
    </div>
  );
}
