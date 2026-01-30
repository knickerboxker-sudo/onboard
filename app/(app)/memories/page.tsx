import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import MemoriesClient from "@/components/memories-client";

export default async function MemoriesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

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
