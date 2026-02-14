"use client";

import Link from "next/link";
import type { Permit } from "@/lib/types";
import { formatCurrency } from "@/lib/api/permits";
import { formatDate } from "@/lib/date";

export function PermitCard({ permit }: { permit: Permit }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{permit.permitType}</span>
        <span className="text-xs text-gray-500">{formatDate(permit.filedDate)}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{permit.address}</h3>
      <p className="text-sm text-gray-500">
        {permit.city}, {permit.state}
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{permit.projectDescription}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-semibold text-blue-600">{formatCurrency(permit.estimatedValue)}</p>
        <Link href={`/permits/${permit.id}`} className="text-sm text-blue-600 hover:underline">
          View Details
        </Link>
      </div>
    </article>
  );
}
