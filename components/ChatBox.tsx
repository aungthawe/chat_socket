"use client";

import { useState, useEffect } from "react";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";

export default function ChatBox() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ user: string; text: string }[]>([]);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !session?.user?.name) return;
    const msg = { user: session.user.name, text: message };
    socket.emit("send_message", msg);
    setChat((prev) => [...prev, msg]);
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="border rounded p-3 h-80 overflow-y-auto bg-white">
        {chat.map((m, i) => (
          <div key={i}>
            <strong>{m.user}: </strong>
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-grow rounded-l"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}
