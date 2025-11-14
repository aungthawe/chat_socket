"use client";

import { useState } from "react";
import OnlineUsers from "@/components/OnlineUsers";
import ChatBox from "@/components/ChatBox2";
import { useSession } from "next-auth/react";

export default function Page() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { data: session } = useSession();

  if (!session)
    return <div className="p-4">Please sign in to start chatting.</div>;

  return (
    <div className="p-4 flex gap-4">
      <div className="w-1/3">
        <OnlineUsers onSelect={(u) => setSelectedUser(u)} />
      </div>

      <div className="flex-1">
        {selectedUser ? (
          <ChatBox recipientId={selectedUser} />
        ) : (
          <div className="text-gray-500 mt-10">Select a user to chat</div>
        )}
      </div>
    </div>
  );
}
