import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchBar } from "@/src/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-ink whitespace-nowrap">
              Search Recall Data
            </h1>
          </div>
          <SearchBar large />
          <p className="text-center text-sm text-muted mt-6">
            Sources: NHTSA, CPSC, FSIS, FDA, EPA, USCG.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
