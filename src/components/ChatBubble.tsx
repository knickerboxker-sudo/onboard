"use client";

import { Message } from "@/src/lib/storage";

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 px-4 py-4 ${
        isUser ? "" : "bg-highlight/40"
      }`}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted mb-1">
          {isUser ? "You" : "sortir"}
        </p>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
          {!isUser && message.content === "" && (
            <span className="typing-cursor" />
          )}
        </div>
      </div>
    </div>
  );
}
