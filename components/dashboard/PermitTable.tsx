import Link from "next/link";
import type { Permit } from "@/lib/types";
import { formatCurrency } from "@/lib/api/permits";
import { formatDate } from "@/lib/date";

export function PermitTable({ permits }: { permits: Permit[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
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
