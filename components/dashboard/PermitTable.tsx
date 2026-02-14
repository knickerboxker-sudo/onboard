import Link from "next/link";
import type { Permit } from "@/lib/types";
import { formatCurrency } from "@/lib/api/permits";
import { formatDate } from "@/lib/date";

export function PermitTable({ permits }: { permits: Permit[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="space-y-3 p-3 md:hidden">
        {permits.map((permit) => (
          <article key={permit.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start justify-between gap-3">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{permit.permitType}</span>
              <span className="text-sm font-medium text-gray-600">{permit.status}</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">{permit.address}</h3>
            <p className="text-sm text-gray-600">
              {permit.city}, {permit.zipCode}
            </p>
            <p className="mt-3 text-2xl font-semibold text-blue-600">{formatCurrency(permit.estimatedValue)}</p>
            <p className="mt-1 text-sm text-gray-500">Filed {formatDate(permit.filedDate)}</p>
            <Link
              href={`/permits/${permit.id}`}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-90"
            >
              View Details
            </Link>
          </article>
        ))}
      </div>
      <table className="hidden min-w-full divide-y divide-gray-200 text-sm md:table">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3">Permit #</th>
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3">Area</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Filed</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {permits.map((permit, index) => (
            <tr key={permit.id} className={index % 2 ? "bg-gray-50/50" : "bg-white"}>
              <td className="px-4 py-3">{permit.permitNumber}</td>
              <td className="px-4 py-3">{permit.address}</td>
              <td className="px-4 py-3">{permit.city}, {permit.zipCode}</td>
              <td className="px-4 py-3">{permit.permitType}</td>
              <td className="px-4 py-3 font-medium text-blue-600">{formatCurrency(permit.estimatedValue)}</td>
              <td className="px-4 py-3">{formatDate(permit.filedDate)}</td>
              <td className="px-4 py-3">{permit.status}</td>
              <td className="px-4 py-3">
                <Link href={`/permits/${permit.id}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
