"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function ChatBox() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Connect only once
    socket = io("http://localhost:3001"); // Socket.IO server URL

    socket.on("chat message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = () => {
    if (!session || input.trim() === "") return;

    // Send to server
    socket.emit("chat message", `${session.user?.name}: ${input}`);
    setInput("");
  };

  return (
    <div className="border rounded-md p-4 mt-4 max-w-2xl mx-auto">
      {!session && (
        <p className="text-red-500 mb-2">You must sign in to send messages.</p>
      )}

      <div className="flex flex-col gap-2 mb-3 max-h-64 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="p-2 rounded bg-blue-100">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!session}
        />
        <button
          onClick={handleSend}
          disabled={!session || input.trim() === ""}
          className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
