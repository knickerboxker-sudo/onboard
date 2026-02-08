import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">About sortir</h1>

        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            sortir is a unified search engine for product recalls across
            multiple U.S. government agencies. Our mission is to make it easy
            for consumers to find recall information that affects them.
          </p>

          <h2 className="text-xl font-semibold text-ink">Data Sources</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-ink">NHTSA</strong> - National Highway
              Traffic Safety Administration: vehicle and equipment recalls
            </li>
            <li>
              <strong className="text-ink">CPSC</strong> - Consumer Product
              Safety Commission: consumer product recalls
            </li>
            <li>
              <strong className="text-ink">USDA FSIS</strong> - Food Safety and
              Inspection Service: meat, poultry, and egg product recalls
            </li>
            <li>
              <strong className="text-ink">FDA</strong> - Food and Drug
              Administration: drug, medical device, and food recalls
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-ink">How It Works</h2>
          <p>
            sortir automatically ingests recall data from official
            government APIs and datasets. Each recall is normalized into a
            unified format, enabling cross-agency search by brand, company,
            product, or keyword.
          </p>
          <p>
            Company and brand names are normalized to improve search results.
            For example, searching for &quot;Ford&quot; will return results from
            both NHTSA vehicle recalls and any other agency that references Ford
            products.
          </p>

          <h2 className="text-xl font-semibold text-ink">Disclaimers</h2>
          <p>
            sortir is not affiliated with any government agency. All recall
            data is sourced from publicly available government endpoints. While
            we strive for accuracy, always verify recall information with the
            original issuing agency. This site is for informational purposes
            only.
          </p>
          <p>
            Data is updated periodically and may not reflect the most recent
            recalls. Always check official sources for the latest information.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
