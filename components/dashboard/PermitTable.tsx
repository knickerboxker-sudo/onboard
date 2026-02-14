import Link from "next/link";
import { CalendarDays, DollarSign, MapPin } from "lucide-react";
import type { Permit } from "@/lib/types";
import { formatCurrency } from "@/lib/api/permits";
import { formatDate } from "@/lib/date";
import { getPermitValueTier } from "@/lib/permit-ui";

function getValueClasses(value: number) {
  const tier = getPermitValueTier(value);
  if (tier === "high") return "text-emerald-600 bg-emerald-50";
  if (tier === "medium") return "text-blue-600 bg-blue-50";
  return "text-slate-600 bg-slate-100";
}

function getStatusClasses(status: Permit["status"]) {
  if (status === "Approved") return "bg-emerald-100 text-emerald-700";
  if (status === "Under Review") return "bg-amber-100 text-amber-700";
  if (status === "Started") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

export function PermitTable({ permits }: { permits: Permit[] }) {
  if (!permits.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-base font-semibold text-slate-900">No permits match your filters yet</p>
        <p className="mt-1 text-sm text-slate-600">Try widening your date range or changing ZIP code filters to discover more leads.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 p-3 md:hidden">
        {permits.map((permit) => {
          const headingId = `permit-mobile-${permit.id}`;
          return (
            <article key={permit.id} aria-labelledby={headingId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{permit.permitType}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(permit.status)}`}>{permit.status}</span>
              </div>
              <h3 id={headingId} className="text-base font-semibold text-slate-900">{permit.address}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {permit.city}, {permit.zipCode}
              </p>
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-2xl font-bold ${getValueClasses(permit.estimatedValue)}`}>
                <DollarSign className="h-4 w-4" />
                {formatCurrency(permit.estimatedValue).replace("$", "")}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Filed {formatDate(permit.filedDate)}
              </p>
              <Link
                href={`/permits/${permit.id}`}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View Details
              </Link>
            </article>
          );
        })}
      </div>
      <div className="hidden grid-cols-2 gap-4 bg-slate-50/40 p-4 md:grid xl:grid-cols-3">
        {permits.map((permit) => {
          const headingId = `permit-desktop-${permit.id}`;
          return (
            <article
              key={permit.id}
              aria-labelledby={headingId}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{permit.permitType}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(permit.status)}`}>{permit.status}</span>
              </div>
              <h3 id={headingId} className="text-lg font-semibold text-slate-900">{permit.address}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                {permit.city}, {permit.zipCode}
              </p>
              <div className={`mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-3xl font-bold ${getValueClasses(permit.estimatedValue)}`}>
                <DollarSign className="h-5 w-5" />
                {formatCurrency(permit.estimatedValue).replace("$", "")}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Filed {formatDate(permit.filedDate)}
              </p>
              <p className="mt-3 text-xs text-slate-400">Permit #{permit.permitNumber}</p>
              <div className="mt-4">
                <Link
                  href={`/permits/${permit.id}`}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
