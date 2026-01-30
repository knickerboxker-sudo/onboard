"use client";

import { useMemo, useState } from "react";
import type { MemoryItem } from "@/types/memory";
import { Search, Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const typeBadge: Record<string, string> = {
  person: "bg-blue-50 text-blue-700",
  tool: "bg-emerald-50 text-emerald-700",
  procedure: "bg-amber-50 text-amber-700",
  acronym: "bg-purple-50 text-purple-700",
  fact: "bg-slate-50 text-slate-700",
  preference: "bg-pink-50 text-pink-700",
  profile_summary: "bg-indigo-50 text-indigo-700"
};

export default function MemoriesClient({
  initialMemories
}: {
  initialMemories: MemoryItem[];
}) {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState(initialMemories);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return memories.filter((memory) =>
      [memory.title, memory.content, memory.type].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [memories, query]);

  const togglePin = async (id: string) => {
    const response = await fetch(`/api/memories?id=${id}`, {
      method: "PATCH"
    });
    if (response.ok) {
      const data = await response.json();
      setMemories(data.memories);
    }
  };

  const deleteMemory = async (id: string) => {
    const response = await fetch(`/api/memories?id=${id}`, {
      method: "DELETE"
    });
    if (response.ok) {
      const data = await response.json();
      setMemories(data.memories);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm text-muted">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full outline-none"
          placeholder="Search memories..."
        />
      </div>

      <div className="space-y-4">
        {filtered.map((memory) => (
          <div
            key={memory.id}
            className="rounded-2xl border border-border bg-highlight p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[11px] font-semibold",
                    typeBadge[memory.type] ?? "bg-slate-100 text-slate-700"
                  )}
                >
                  {memory.type.replace("_", " ")}
                </span>
                <h3 className="mt-2 text-sm font-semibold">{memory.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePin(memory.id)}
                  className={cn(
                    "rounded-full border border-border p-2 text-muted",
                    memory.pinned && "bg-ink text-white"
                  )}
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="rounded-full border border-border p-2 text-muted"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{memory.content}</p>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-muted">No memories yet.</p>
        )}
      </div>
    </div>
  );
}
