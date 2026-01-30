export type Message = {
  id: string;
  userId: string;
  role: string;
  content: string;
  createdAt: Date;
  isNote?: boolean | null;
  audioPath?: string | null;
};
