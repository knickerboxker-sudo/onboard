"use client";

import { useChatStore } from "@/src/lib/store";
import {
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeft,
  Trash2,
} from "lucide-react";

export default function Sidebar() {
  const {
    conversations,
    activeId,
    sidebarOpen,
    newConversation,
    setActive,
    toggleSidebar,
    deleteConversation,
  } = useChatStore();

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-soft text-muted hover:text-ink transition-colors"
        aria-label="Open sidebar"
      >
        <PanelLeft size={18} />
      </button>
    );
  }

  return (
    <aside className="w-64 shrink-0 h-screen bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <img
            src="/sortir-logo-192.png"
            alt="sortir"
            className="w-6 h-6 rounded"
          />
          <span className="font-semibold text-sm tracking-tight">sortir</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-highlight transition-colors"
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 py-2">
        <button
          onClick={newConversation}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-border text-muted hover:text-ink hover:border-accent hover:bg-accent-light transition-all"
        >
          <MessageSquarePlus size={16} />
          New chat
        </button>
      </div>

      {/* Conversation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
              c.id === activeId
                ? "bg-accent-light text-accent font-medium"
                : "text-muted hover:bg-highlight hover:text-ink"
            }`}
            onClick={() => setActive(c.id)}
          >
            <span className="truncate flex-1">{c.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(c.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted hover:text-danger transition-all"
              aria-label="Delete conversation"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="text-xs text-muted px-3 py-4 text-center">
            No conversations yet
          </p>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[11px] text-muted leading-relaxed">
          Private &middot; Data stored locally
        </p>
      </div>
    </aside>
  );
}
