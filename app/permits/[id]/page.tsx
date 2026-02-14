import Link from "next/link";
import { notFound } from "next/navigation";
import { getPermitById, formatCurrency, getPermits } from "@/lib/api/permits";
import { formatDate } from "@/lib/date";

export default async function PermitDetailPage({ params }: { params: { id: string } }) {
  const permit = await getPermitById(params.id);

  if (!permit) {
    notFound();
  }

  const nearbyPermits = (await getPermits({ city: permit.city })).filter((item) => item.id !== permit.id).slice(0, 3);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/permits" className="hover:underline">
          Permits
        </Link>{" "}
        / {permit.permitNumber}
      </nav>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h1 className="text-2xl font-semibold text-gray-900">{permit.address}</h1>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">City</p>
              <p className="text-sm text-gray-800">{permit.city}, {permit.state}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Filed date</p>
              <p className="text-sm text-gray-800">{formatDate(permit.filedDate)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Permit type</p>
              <p className="text-sm text-gray-800">{permit.permitType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Estimated value</p>
              <p className="text-sm font-medium text-blue-600">{formatCurrency(permit.estimatedValue)}</p>
            </div>
          </div>
          <article className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">{permit.projectDescription}</article>
        </section>
        <aside className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <button className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-90">
            Save Lead
          </button>
          <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Set Alert for Similar
          </button>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Related nearby permits</h2>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              {nearbyPermits.map((item) => (
                <li key={item.id}>
                  <Link href={`/permits/${item.id}`} className="hover:underline">
                    {item.address}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
