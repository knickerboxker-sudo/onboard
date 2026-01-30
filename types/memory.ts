export type MemoryItem = {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  embedding?: unknown;
  sourceMessageId?: string | null;
  pinned: boolean;
  archived: boolean;
  createdAt: Date;
};
