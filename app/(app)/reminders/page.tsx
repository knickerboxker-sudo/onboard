import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import RemindersClient from "@/components/reminders-client";

export default async function RemindersPage() {
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
