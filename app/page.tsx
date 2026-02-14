import Image from "next/image";
import Link from "next/link";
import { getPermits } from "@/lib/api/permits";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PermitTable } from "@/components/dashboard/PermitTable";

export default async function DashboardPage() {
  const permits = await getPermits();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-lg border border-gray-200 bg-gray-50 p-6 sm:grid-cols-[2fr,1fr]">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Get leads before your competition</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Monitor Michigan permits and act fast on high-value opportunities.
          </p>
          <Link
            href="/permits"
            className="mt-4 inline-flex rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-90"
          >
            View All Permits
          </Link>
        </div>
        <Image
          src="/IMG_0339.png"
          alt="Permit lead dashboard visual"
          width={360}
          height={220}
          className="h-48 w-full rounded-lg object-cover"
          priority
        />
      </section>
      <StatsOverview permits={permits} />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent permits</h2>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Top 10</span>
        </div>
        <PermitTable permits={permits.slice(0, 10)} />
      </section>
    </div>
  );
}
