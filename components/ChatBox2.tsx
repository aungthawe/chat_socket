"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

interface ChatBoxProps {
  currentUserId: string;
  receiverId: string | null;
}

export default function ChatBox({ currentUserId, receiverId }: ChatBoxProps) {
  const [allMessages, setAllMessages] = useState<
    Record<string, { sender: string; text: string }[]>
  >({});
  const [input, setInput] = useState("");

  // INITIALIZE SOCKET
  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:4000");

      // Listen for incoming private message
      socket.on("private-message", ({ senderId, message }) => {
        console.log("💬 Incoming Message:", senderId, message);

        setAllMessages((prev) => ({
          ...prev,
          [senderId]: [
            ...(prev[senderId] || []),
            { sender: senderId, text: message },
          ],
        }));
      });
    }
  }, []);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!receiverId || !input.trim()) return;

    socket?.emit("send-private", {
      senderId: currentUserId,
      receiverId,
      message: input,
    });

    // Store outgoing message in receiver's chat
    setAllMessages((prev) => ({
      ...prev,
      [receiverId]: [
        ...(prev[receiverId] || []),
        { sender: "You", text: input },
      ],
    }));

    console.log(
      "📤 Sent → Receiver:",
      receiverId,
      "| Sender:",
      currentUserId,
      "| Message:",
      input
    );

    setInput("");
  };

  // NO RECEIVER SELECTED
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
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m, idx) => (
          <div key={idx} className="mb-2">
            <strong>{m.sender}: </strong> {m.text}
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
      </div>
    </div>
  );
}
