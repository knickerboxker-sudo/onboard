import ConfigAlert from "@/components/config-alert";
import RemindersClient from "@/components/reminders-client";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import { getMissingEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const missingEnv = getMissingEnv(["DATABASE_URL"]);
  if (missingEnv.length > 0) {
    return (
      <div className="pb-24 md:pb-4">
        <ConfigAlert
          title="Database not configured"
          description="Reminders require a database connection."
          missing={missingEnv}
        />
      </div>
    );
  }

  const userId = await getDefaultUserId();

  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { dueAt: "asc" }
  });

  return (
    <div className="pb-24 md:pb-4">
      <RemindersClient initialReminders={reminders} />
    </div>
  );
}
