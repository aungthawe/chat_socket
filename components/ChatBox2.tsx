"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import type { Message, ChatUser } from "@/types/chat";

const socket: Socket = io("http://localhost:3001");

export default function ChatBox({ recipientId }: { recipientId: string }) {
  const { data: session } = useSession();

  const user: ChatUser | null = session?.user
    ? {
        id: session.user.email ?? "",
        name: session.user.name ?? "Unknown",
        email: session.user.email ?? "",
        image: session.user.image ?? "",
      }
    : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Join socket & load history
  useEffect(() => {
    if (!user) return;

    socket.emit("join", { userId: user.id });

    socket.emit("conversation:load", {
      userId: user.id,
      otherUserId: recipientId,
    });

    socket.on("conversation:history", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("message:receive", (msg: Message) => {
      if (msg.sender.id === recipientId || msg.recipientId === recipientId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("conversation:history");
      socket.off("message:receive");
    };
  }, [user, recipientId]);

  const sendMessage = () => {
    if (!user || !input.trim()) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: user,
      recipientId,
      createdAt: new Date().toISOString(),
      conversationId: "",
    };

    socket.emit("message:send", msg);

    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="p-4 border rounded">
      <div className="max-h-64 overflow-y-auto mb-2">
        {messages.map((m) => (
          <div key={m.id} className="p-2 bg-gray-100 my-1 rounded">
            <b>{m.sender.name}:</b> {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
