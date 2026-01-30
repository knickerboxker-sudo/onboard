export type Reminder = {
  id: string;
  userId: string;
  text: string;
  dueAt: Date;
  completed: boolean;
  sourceMessageId?: string | null;
  createdAt: Date;
};
