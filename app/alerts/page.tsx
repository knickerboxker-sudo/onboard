export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Configure Your Lead Alerts</h1>
      <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No alerts yet. Create your first alert to get matched permits instantly.</p>
        <button className="mt-4 min-h-11 rounded-md bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-90">
          Create Your First Alert
        </button>
      </section>
    </div>
  );
}
