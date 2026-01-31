import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import ChatClient from "@/components/chat-client";

export default async function ChatPage() {
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
