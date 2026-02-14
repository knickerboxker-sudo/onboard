const tiers = [
  { name: "Starter", price: "$50/mo", details: "1 city, 10 leads/day" },
  { name: "Professional", price: "$150/mo", details: "3 cities, 50 leads/day" },
  { name: "Enterprise", price: "Custom", details: "Unlimited" },
];

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Get Leads Before Your Competition</h1>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{tier.name}</h2>
            <p className="mt-2 text-2xl text-blue-600">{tier.price}</p>
            <p className="mt-2 text-sm text-gray-600">{tier.details}</p>
            <button className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:brightness-90">
              Start Free Trial
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
