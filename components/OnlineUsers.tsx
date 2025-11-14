"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function OnlineUsers({
  onSelect,
}: {
  onSelect: (userId: string) => void;
}) {
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    socket.on("presence:update", (users: string[]) => {
      setOnline(users);
    });

    return () => {
      socket.off("presence:update");
    };
  }, []);

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="font-bold mb-2">Online Users</h2>
      {online.map((u) => (
        <button
          key={u}
          onClick={() => onSelect(u)}
          className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded mb-1"
        >
          {u}
        </button>
      ))}
    </div>
  );
}
