"use client";

import { Message } from "@/src/lib/storage";
import { Bot, User } from "lucide-react";

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 px-4 py-3 ${
        isUser ? "" : "bg-highlight/50"
      }`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white ${
          isUser ? "bg-accent" : "bg-ink"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
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
