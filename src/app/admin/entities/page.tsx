"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

interface EntityAlias {
  id: string;
  type: string;
  canonical: string;
  alias: string;
  normalizedAlias: string;
  source: string;
  confidence: number;
}

export default function AdminEntitiesPage() {
  const [aliases, setAliases] = useState<EntityAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "company",
    canonical: "",
    alias: "",
  });
  const [message, setMessage] = useState("");

  const loadAliases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/entities", {
        headers: {
          "x-admin-key":
            document.cookie.split("admin_key=")[1]?.split(";")[0] || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAliases(data.aliases || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAliases();
  }, []);

  const handleSubmit = async () => {
    if (!formData.canonical || !formData.alias) return;
    setMessage("");
    try {
      const res = await fetch("/api/admin/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key":
            document.cookie.split("admin_key=")[1]?.split(";")[0] || "",
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage("Alias added");
        setFormData({ type: "company", canonical: "", alias: "" });
        setShowForm(false);
        await loadAliases();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to add alias");
      }
    } catch {
      setMessage("Failed to add alias");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Entity Aliases</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm transition-colors"
        >
          <Plus size={14} />
          Add Alias
        </button>
      </div>

      {message && (
        <div className="bg-highlight border border-border rounded p-3 mb-4 text-sm">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full bg-highlight border border-border rounded px-3 py-2 text-sm text-ink"
              >
                <option value="company">Company</option>
                <option value="brand">Brand</option>
                <option value="product">Product</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">
                Canonical Name
              </label>
              <input
                value={formData.canonical}
                onChange={(e) =>
                  setFormData({ ...formData, canonical: e.target.value })
                }
                placeholder="e.g. ford"
                className="w-full bg-highlight border border-border rounded px-3 py-2 text-sm text-ink placeholder:text-muted"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">Alias</label>
              <input
                value={formData.alias}
                onChange={(e) =>
                  setFormData({ ...formData, alias: e.target.value })
                }
                placeholder="e.g. Ford Motor Company"
                className="w-full bg-highlight border border-border rounded px-3 py-2 text-sm text-ink placeholder:text-muted"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-3 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Save Alias
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Canonical
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Alias
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {aliases.map((alias) => (
                <tr
                  key={alias.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-muted">{alias.type}</td>
                  <td className="px-4 py-3">{alias.canonical}</td>
                  <td className="px-4 py-3">{alias.alias}</td>
                  <td className="px-4 py-3 text-muted">{alias.source}</td>
                  <td className="px-4 py-3 text-muted">{alias.confidence}%</td>
                </tr>
              ))}
              {aliases.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted"
                  >
                    No aliases configured. Click "Add Alias" to create entity
                    mappings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
