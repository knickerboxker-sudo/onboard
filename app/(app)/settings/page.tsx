import ConfigAlert from "@/components/config-alert";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import { getMissingEnv } from "@/lib/env";
import { updatePrivateMode } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const missingEnv = getMissingEnv(["DATABASE_URL"]);
  if (missingEnv.length > 0) {
    return (
      <div className="pb-24 md:pb-4">
        <ConfigAlert
          title="Database not configured"
          description="Settings require a database connection."
          missing={missingEnv}
        />
      </div>
    );
  }

  const userId = await getDefaultUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return (
    <div className="pb-24 md:pb-4">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted">
          Control privacy and export your data.
        </p>

        <form action={updatePrivateMode} className="mt-6 space-y-4">
          <label className="flex items-center justify-between rounded-2xl border border-border bg-highlight px-4 py-3 text-sm">
            <div>
              <p className="font-medium">Private mode</p>
              <p className="text-xs text-muted">
                When enabled, OnboardAI stops auto-extracting memories.
              </p>
            </div>
            <input
              type="checkbox"
              name="privateMode"
              defaultChecked={user?.privateMode}
              className="h-4 w-4"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Save settings
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-border bg-highlight p-4">
          <p className="text-sm font-medium">Export data</p>
          <p className="text-xs text-muted">
            Download your messages, memories, and reminders as JSON.
          </p>
          <a
            href="/api/export"
            className="mt-3 inline-flex rounded-xl border border-border px-3 py-2 text-xs font-semibold"
          >
            Download JSON
          </a>
        </div>
      </div>
    </div>
  );
}
