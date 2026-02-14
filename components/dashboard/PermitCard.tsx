"use client";

import Link from "next/link";
import { CalendarDays, DollarSign, MapPin } from "lucide-react";
import type { Permit } from "@/lib/types";
import { formatCurrency } from "@/lib/api/permits";
import { formatDate } from "@/lib/date";
import { getPermitStatusClasses, getPermitValueClasses } from "@/lib/permit-ui";

export function PermitCard({ permit }: { permit: Permit }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">{permit.permitType}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPermitStatusClasses(permit.status)}`}>{permit.status}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{permit.address}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
        <MapPin className="h-3.5 w-3.5 text-slate-400" />
        {permit.city}, {permit.state}
      </p>
      <div className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-3xl font-bold ${getPermitValueClasses(permit.estimatedValue, "card")}`}>
        <DollarSign className="h-5 w-5" />
        {formatCurrency(permit.estimatedValue).replace("$", "")}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        Filed {formatDate(permit.filedDate)}
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{permit.projectDescription}</p>
      <div className="mt-5">
        <Link
          href={`/permits/${permit.id}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
