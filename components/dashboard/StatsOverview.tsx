import type { Permit } from "@/lib/types";
import { formatCurrency, getPermitStats } from "@/lib/api/permits";

export function StatsOverview({ permits }: { permits: Permit[] }) {
  const stats = getPermitStats(permits);

  const cards = [
    { label: "Total permits this week", value: stats.totalThisWeek.toString() },
    { label: "Avg permit value", value: formatCurrency(stats.averageValue) },
    { label: "Hot leads", value: stats.hotLeads.toString() },
    { label: "New this week value", value: formatCurrency(stats.newValueThisWeek) },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
