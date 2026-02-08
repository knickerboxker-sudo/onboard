"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, categoryLabel, categoryColor } from "@/src/lib/utils";

interface RecallEvent {
  id: string;
  title: string;
  category: string;
  source: string;
  publishedAt: string;
  companyName: string | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<RecallEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        params.set("page", String(page));
        params.set("pageSize", "50");

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.results || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Normalized Events</h1>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="bg-card border border-border rounded px-3 py-2 text-sm text-ink"
        >
          <option value="">All Categories</option>
          <option value="vehicle">Vehicle</option>
          <option value="consumer">Consumer</option>
          <option value="food">Food</option>
          <option value="drug">Drug</option>
          <option value="device">Medical Device</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Company
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${categoryColor(event.category)}`}
                    >
                      {categoryLabel(event.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-md">
                    <Link
                      href={`/event/${event.id}`}
                      className="hover:text-accent transition-colors"
                    >
                      {event.title.length > 80
                        ? event.title.slice(0, 80) + "..."
                        : event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {event.companyName || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted">{event.source}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {formatDate(event.publishedAt)}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted"
                  >
                    No events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm border border-border rounded text-muted hover:text-ink disabled:opacity-30 transition-colors"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-muted">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-3 py-1.5 text-sm border border-border rounded text-muted hover:text-ink transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
