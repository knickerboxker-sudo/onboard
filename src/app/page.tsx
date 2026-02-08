import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchBar } from "@/src/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-5xl font-bold mb-4 tracking-tight text-ink">
              Search Recall Data
            </h1>
            <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">
              Unified search across vehicles, consumer products, food, drugs,
              medical devices, environmental hazards, and marine equipment from
              six federal agencies.
            </p>
          </div>
          <SearchBar large />
        </section>

        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {[
              { label: "NHTSA", desc: "Vehicle Recalls" },
              { label: "CPSC", desc: "Consumer Products" },
              { label: "FSIS", desc: "Food Safety" },
              { label: "FDA", desc: "Drugs & Devices" },
              { label: "EPA", desc: "Environmental" },
              { label: "USCG", desc: "Marine & Boating" },
            ].map((source) => (
              <div
                key={source.label}
                className="bg-white border border-border rounded-xl p-4 shadow-card"
              >
                <p className="font-semibold text-ink text-sm">{source.label}</p>
                <p className="text-xs text-muted mt-1">{source.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
