import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ChatClient from "@/components/chat-client";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

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
