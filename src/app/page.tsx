import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchBar } from "@/src/components/SearchBar";
import { RecallCard } from "@/src/components/RecallCard";
import { prisma } from "@/src/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let latestEvents: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    source: string;
    publishedAt: Date;
    companyName: string | null;
    companyNormalized: string | null;
  }> = [];

  if (prisma) {
    try {
      latestEvents = await prisma.recallEvent.findMany({
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          summary: true,
          category: true,
          source: true,
          publishedAt: true,
          companyName: true,
          companyNormalized: true,
        },
      });
    } catch {
      // Database may not be available yet
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              Search Recall Data
            </h1>
            <p className="text-muted text-lg">
              Unified search across vehicles, consumer products, food, drugs,
              and medical devices.
            </p>
          </div>
          <SearchBar large />
        </section>

        {latestEvents.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="text-lg font-semibold mb-4 text-muted">
              Latest Recalls
            </h2>
            <div className="space-y-3">
              {latestEvents.map((event) => (
                <RecallCard key={event.id} {...event} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
