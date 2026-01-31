import ConfigAlert from "@/components/config-alert";
import MemoriesClient from "@/components/memories-client";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import { getMissingEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const missingEnv = getMissingEnv(["DATABASE_URL"]);
  if (missingEnv.length > 0) {
    return (
      <div className="pb-24 md:pb-4">
        <ConfigAlert
          title="Database not configured"
          description="Memories require a database connection."
          missing={missingEnv}
        />
      </div>
    );
  }

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
