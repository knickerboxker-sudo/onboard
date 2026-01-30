import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import RemindersClient from "@/components/reminders-client";

export default async function RemindersPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

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
