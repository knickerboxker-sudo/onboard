import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchBar } from "@/src/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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

        <section className="max-w-3xl mx-auto px-4 pb-16 text-center text-muted">
          <p>
            Start with a search to fetch live recall data from federal agencies.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
