"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import ChatPage from "./ChatPage";

interface PrivateMessagePayload {
  senderId: string;
  message: string;
}

interface SendMessagePayload {
  senderId: string;
  receiverId: string;
  message: string;
}

interface ChatBoxProps {
  currentUserId: string;
  receiverId: string | null;
}

interface ChatMessage {
  sender: string;
  text: string;
}

export default function ChatBox({ currentUserId, receiverId }: ChatBoxProps) {
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(
    {}
  );
  const [input, setInput] = useState("");

  // 🔌 CONNECT & REGISTER USER ONLINE
  useEffect(() => {
    if (!currentUserId) return;

    if (!socket.connected) {
      socket.connect();
    }

    // ➜ Register user on server
    socket.emit("user-online", currentUserId);

    // ➜ Listen for private messages
    const handleIncomingMessage = ({
      senderId,
      message,
    }: PrivateMessagePayload) => {
      console.log("💬 Received:", senderId, message);

      setAllMessages((prev) => ({
        ...prev,
        [senderId]: [
          ...(prev[senderId] || []),
          { sender: senderId, text: message },
        ],
      }));
    };

    socket.on("private-message", handleIncomingMessage);

    return () => {
      socket.off("private-message", handleIncomingMessage);
    };
  }, [currentUserId]);

  // 📤 SEND MESSAGE
  const sendMessage = () => {
    if (!receiverId || !input.trim()) return;

    const payload: SendMessagePayload = {
      senderId: currentUserId,
      receiverId,
      message: input,
    };

    socket.emit("send-private", payload);

    console.log("📤 Sent:", payload);

    // Show message in UI instantly
    setAllMessages((prev) => ({
      ...prev,
      [receiverId]: [
        ...(prev[receiverId] || []),
        { sender: "You", text: input },
      ],
    }));

    setInput("");
  };

  // 🛑 NO RECEIVER SELECTED
  if (!receiverId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user to chat
      </div>
    );
  }

  const messages = allMessages[receiverId] || [];

  return (
    <div className="flex flex-col flex-1 bg-gray-100 h-full">
      {/* <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <strong>{msg.sender}: </strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div> */}

      <ChatPage />
    </div>
  );
}
