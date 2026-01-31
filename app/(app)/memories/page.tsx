import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import MemoriesClient from "@/components/memories-client";

export default async function MemoriesPage() {
  const userId = await getDefaultUserId();

  const memories = await prisma.memoryItem.findMany({
    where: { userId, archived: false },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });

  return (
    <div className="pb-24 md:pb-4">
      <MemoriesClient initialMemories={memories} />
    </div>
  );
}
