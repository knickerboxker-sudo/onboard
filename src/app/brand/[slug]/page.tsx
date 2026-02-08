import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { RecallCard } from "@/src/components/RecallCard";
import { prisma } from "@/src/server/db/prisma";
import { notFound } from "next/navigation";
import { Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = decodeURIComponent(params.slug);

  let events;
  try {
    if (!prisma) {
      notFound();
    }
    events = await prisma.recallEvent.findMany({
      where: {
        brandNames: {
          has: slug,
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    notFound();
  }

  if (!events || events.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Tag size={28} className="text-muted" />
          <div>
            <h1 className="text-2xl font-bold">{slug}</h1>
            <p className="text-sm text-muted">Brand recall history</p>
          </div>
        </div>

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
