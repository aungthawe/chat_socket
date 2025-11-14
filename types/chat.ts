// types/chat.ts
export type ChatUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type Message = {
  id: string;
  content: string;
  sender: ChatUser;
  recipientId: string;
  createdAt: string;
  conversationId: string;
};
