"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import OnlineUserList from "@/components/OnlineUsers";
import ChatBox from "@/components/ChatBox2";

let socket: Socket | null = null;

export default function ChatPage() {
  const [currentUserId] = useState(() => {
    return "user-" + Math.floor(Math.random() * 10000);
  });

  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("connect", () => {
      socket?.emit("user-online", currentUserId);
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Online Users List */}
      <OnlineUserList
        onlineUsers={onlineUsers}
        onSelect={setSelectedUserId}
        currentUserId={currentUserId}
      />

      {/* Chat Box */}
      <ChatBox currentUserId={currentUserId} receiverId={selectedUserId} />
    </div>
  );
}
