"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function ChatBox() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<
    { user: string; text: string; time: string }[]
  >([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket = io("http://localhost:3001");

    socket.on(
      "chat message",
      (msg: { user: string; text: string; time: string }) => {
        setMessages((prev) => [...prev, msg]);
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!session || input.trim() === "") return;

    const msg = {
      user: session.user?.name || "Anonymous",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("chat message", msg);
    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl shadow-lg bg-white border">
      {!session && (
        <p className="text-red-500 mb-2 text-sm">
          You must sign in to send messages.
        </p>
      )}

      <div className="flex flex-col gap-2 mb-3 max-h-80 overflow-y-auto px-1">
        {messages.map((msg, idx) => {
          const isOwn = session?.user?.name === msg.user;
          return (
            <div
              key={idx}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-3 py-1 rounded-lg max-w-[75%] break-words ${
                  isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                {msg.user} • {msg.time}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!session}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!session || input.trim() === ""}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
