import ChatClient from "@/components/chat-client";
import ConfigAlert from "@/components/config-alert";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import { getMissingEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const missingEnv = getMissingEnv(["DATABASE_URL", "COHERE_API_KEY"]);
  if (missingEnv.length > 0) {
    return (
      <div className="pb-24 md:pb-4">
        <ConfigAlert
          title="Missing configuration"
          description="Set the required environment variables to load chat."
          missing={missingEnv}
        />
      </div>
    );
  }

  const userId = await getDefaultUserId();

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 100
  });

  return (
    <div className="pb-24 md:pb-4">
      <ChatClient initialMessages={messages} />
    </div>
  );
}
