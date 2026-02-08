import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { RecallCard } from "@/src/components/RecallCard";
import { prisma } from "@/src/server/db/prisma";
import { notFound } from "next/navigation";
import { categoryLabel } from "@/src/lib/utils";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = decodeURIComponent(params.slug);

  let events;
  try {
    events = await prisma.recallEvent.findMany({
      where: { companyNormalized: slug },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    notFound();
  }

  if (!events || events.length === 0) {
    notFound();
  }

  const displayName = events[0].companyName || slug;
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const recentCount = events.filter(
    (e) => new Date(e.publishedAt) >= oneYearAgo
  ).length;

  const categoryCounts: Record<string, number> = {};
  for (const e of events) {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={28} className="text-muted" />
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-sm text-muted">Company recall profile</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-xs text-muted">Total Recalls</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{recentCount}</div>
            <div className="text-xs text-muted">Last 12 Months</div>
          </div>
          {Object.entries(categoryCounts)
            .slice(0, 2)
            .map(([cat, count]) => (
              <div
                key={cat}
                className="bg-card border border-border rounded-lg p-4 text-center"
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted">{categoryLabel(cat)}</div>
              </div>
            ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Recent Recalls</h2>
        <div className="space-y-3">
          {events.map((event) => (
            <RecallCard key={event.id} {...event} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
