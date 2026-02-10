import { create } from "zustand";
import {
  Conversation,
  Message,
  loadConversations,
  saveConversations,
  generateId,
} from "./storage";

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  sidebarOpen: boolean;

  hydrate: () => void;
  newConversation: () => void;
  setActive: (id: string) => void;
  toggleSidebar: () => void;
  addMessage: (msg: Omit<Message, "id" | "createdAt">) => void;
  appendToLastAssistant: (token: string) => void;
  deleteConversation: (id: string) => void;
  setConversationTitle: (id: string, title: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeId: null,
  sidebarOpen: false,

  hydrate: () => {
    const conversations = loadConversations();
    set({
      conversations,
      activeId: conversations.length > 0 ? conversations[0].id : null,
    });
  },

  newConversation: () => {
    const conv: Conversation = {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const conversations = [conv, ...get().conversations];
    saveConversations(conversations);
    set({ conversations, activeId: conv.id });
  },

  setActive: (id) => set({ activeId: id }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  addMessage: (msg) => {
    const { conversations, activeId } = get();
    const updated = conversations.map((c) => {
      if (c.id !== activeId) return c;
      return {
        ...c,
        messages: [
          ...c.messages,
          { ...msg, id: generateId(), createdAt: Date.now() },
        ],
        updatedAt: Date.now(),
      };
    });
    saveConversations(updated);
    set({ conversations: updated });
  },

  appendToLastAssistant: (token) => {
    const { conversations, activeId } = get();
    const updated = conversations.map((c) => {
      if (c.id !== activeId) return c;
      const msgs = [...c.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        msgs[msgs.length - 1] = { ...last, content: last.content + token };
      }
      return { ...c, messages: msgs, updatedAt: Date.now() };
    });
    saveConversations(updated);
    set({ conversations: updated });
  },

  deleteConversation: (id) => {
    const conversations = get().conversations.filter((c) => c.id !== id);
    saveConversations(conversations);
    const activeId =
      get().activeId === id
        ? conversations[0]?.id ?? null
        : get().activeId;
    set({ conversations, activeId });
  },

  setConversationTitle: (id, title) => {
    const conversations = get().conversations.map((c) =>
      c.id === id ? { ...c, title } : c
    );
    saveConversations(conversations);
    set({ conversations });
  },
}));
