"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/src/lib/store";
import Sidebar from "@/src/components/Sidebar";
import ChatBubble from "@/src/components/ChatBubble";
import ChatInput from "@/src/components/ChatInput";

export default function Home() {
  const {
    conversations,
    activeId,
    sidebarOpen,
    hydrate,
    newConversation,
    addMessage,
    appendToLastAssistant,
    setConversationTitle,
  } = useChatStore();

  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const active = conversations.find((c) => c.id === activeId);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeId) {
        newConversation();
      }

      // Allow Zustand state to settle after newConversation() so activeId is available
      const STATE_SETTLE_MS = 50;
      await new Promise((r) => setTimeout(r, STATE_SETTLE_MS));

      const currentState = useChatStore.getState();
      const currentId = currentState.activeId;
      const currentConv = currentState.conversations.find(
        (c) => c.id === currentId
      );

      if (!currentConv) return;

      // Set title from the first user message
      if (currentConv.messages.length === 0) {
        setConversationTitle(
          currentConv.id,
          text.length > 40 ? text.slice(0, 40) + "…" : text
        );
      }

      addMessage({ role: "user", content: text });
      addMessage({ role: "assistant", content: "" });
      setStreaming(true);

      try {
        const state = useChatStore.getState();
        const conv = state.conversations.find((c) => c.id === currentId);
        const history = (conv?.messages ?? [])
          .filter((m) => m.content !== "")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok) {
          const err = await res.json();
          appendToLastAssistant(
            err.error ?? "Something went wrong. Please try again."
          );
          setStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          appendToLastAssistant("No response stream available.");
          setStreaming(false);
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") continue;

            try {
              const data = JSON.parse(payload);
              if (data.text) {
                appendToLastAssistant(data.text);
              }
              if (data.error) {
                appendToLastAssistant(`\n\nError: ${data.error}`);
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      } catch (err) {
        appendToLastAssistant(
          "\n\nFailed to connect. Check your network and API key."
        );
      } finally {
        setStreaming(false);
      }
    },
    [
      activeId,
      newConversation,
      addMessage,
      appendToLastAssistant,
      setConversationTitle,
    ]
  );

  return (
    <div className="flex min-h-[100dvh] h-[100dvh] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Chat Area */}
        {active ? (
          <>
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {active.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4 text-white text-lg font-semibold">
                      S
                    </div>
                    <h2 className="text-lg font-semibold mb-1">
                      How can I help you?
                    </h2>
                    <p className="text-sm text-muted max-w-md">
                      Start a conversation with sortir. Your messages are stored
                      privately in your browser{"'"}s local storage.
                    </p>
                  </div>
                )}

                {active.messages.map((m) => (
                  <ChatBubble key={m.id} message={m} />
                ))}
              </div>
            </div>

            <ChatInput onSend={handleSend} disabled={streaming} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <img
              src="/sortir-logo-512.png"
              alt="sortir"
              className="w-16 h-16 rounded-2xl mb-6 shadow-card"
            />
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Welcome to sortir
            </h1>
            <p className="text-muted text-sm mb-6 max-w-sm">
              Your private AI assistant. All conversations stay in your
              browser&mdash;nothing is stored on a server.
            </p>
            <button
              onClick={newConversation}
              className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-hover transition-colors shadow-soft"
            >
              Start a new chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
