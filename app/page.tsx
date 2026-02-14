import Image from "next/image";
import Link from "next/link";
import { getPermits } from "@/lib/api/permits";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PermitTable } from "@/components/dashboard/PermitTable";

export default async function DashboardPage() {
  const permits = await getPermits();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:gap-6 sm:p-6 md:grid-cols-[2fr,1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Get leads before your competition</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Monitor Michigan permits and act fast on high-value opportunities.
          </p>
          <Link
            href="/permits"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-90"
          >
            View All Permits
          </Link>
        </div>
        <Image
          src="/IMG_0339.png"
          alt="Permit lead dashboard visual"
          width={360}
          height={220}
          className="mx-auto hidden h-40 w-full max-w-xs rounded-lg object-cover sm:block md:h-48 md:max-w-none"
          priority
        />
      </section>
      <StatsOverview permits={permits} />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recently filed permits</h2>
          <Link href="/permits" className="inline-flex min-h-11 items-center text-sm font-medium text-blue-600 hover:underline">
            Search and sort all permits
          </Link>
        </div>
        <PermitTable permits={permits.slice(0, 10)} />
      </section>
    </div>
  );
}
