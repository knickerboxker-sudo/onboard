"use client";

import { useMemo, useState } from "react";
import type { Reminder } from "@prisma/client";
import { CheckCircle2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RemindersClient({
  initialReminders
}: {
  initialReminders: Reminder[];
}) {
  const [reminders, setReminders] = useState(initialReminders);

  const dueReminders = useMemo(() => {
    const now = new Date();
    return reminders.filter((reminder) => new Date(reminder.dueAt) <= now && !reminder.completed);
  }, [reminders]);

  const toggleComplete = async (id: string) => {
    const response = await fetch(`/api/reminders?id=${id}`, { method: "PATCH" });
    if (response.ok) {
      const data = await response.json();
      setReminders(data.reminders);
    }
  };

  const exportIcs = async () => {
    const response = await fetch("/api/reminders?format=ics");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "onboardai-reminders.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reminders</h2>
          <p className="text-sm text-muted">Stay on top of follow-ups.</p>
        </div>
        <button
          onClick={exportIcs}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-ink"
        >
          <Download className="h-4 w-4" />
          Export .ics
        </button>
      </div>

      {dueReminders.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Due now</p>
          <ul className="mt-2 space-y-1">
            {dueReminders.map((reminder) => (
              <li key={reminder.id}>{reminder.text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-border bg-highlight px-4 py-3",
              reminder.completed && "opacity-60"
            )}
          >
            <div>
              <p className="text-sm font-medium">{reminder.text}</p>
              <p className="text-xs text-muted">
                {new Date(reminder.dueAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => toggleComplete(reminder.id)}
              className={cn(
                "rounded-full border border-border p-2 text-muted",
                reminder.completed && "bg-ink text-white"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <p className="text-sm text-muted">No reminders yet.</p>
        )}
      </div>
    </div>
  );
}
