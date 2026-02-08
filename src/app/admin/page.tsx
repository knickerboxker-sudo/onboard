"use client";

import { useEffect, useState } from "react";
import { Activity, Database, FileText, Users } from "lucide-react";
import Link from "next/link";

interface Stats {
  events: number;
  raw: number;
  jobs: number;
  entities: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [events, raw, jobs, entities] = await Promise.all([
          fetch("/api/search?pageSize=0")
            .then((r) => r.json())
            .then((d) => d.total || 0)
            .catch(() => 0),
          0, // Raw count would need a separate endpoint
          0,
          0,
        ]);
        setStats({ events, raw, jobs, entities });
      } catch {
        setStats({ events: 0, raw: 0, jobs: 0, entities: 0 });
      }
    }
    load();
  }, []);

  const cards = [
    {
      icon: FileText,
      label: "Recall Events",
      value: stats?.events ?? "-",
      href: "/admin/events",
    },
    {
      icon: Database,
      label: "Raw Records",
      value: stats?.raw ?? "-",
      href: "/admin/raw",
    },
    {
      icon: Activity,
      label: "Job Runs",
      value: stats?.jobs ?? "-",
      href: "/admin/jobs",
    },
    {
      icon: Users,
      label: "Entity Aliases",
      value: stats?.entities ?? "-",
      href: "/admin/entities",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-card border border-border rounded-lg p-5 hover:border-accent/50 transition-colors"
          >
            <card.icon size={20} className="text-muted mb-2" />
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-muted">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
