"use client";

import { useEffect, useState } from "react";

interface OnlineUsersProps {
  onlineUsers: Record<string, string>;
  onSelect: (userId: string) => void;
  currentUserId: string;
}

export default function OnlineUserList({
  onlineUsers,
  onSelect,
  currentUserId,
}: OnlineUsersProps) {
  return (
    <div className="w-64 bg-gray-900 text-white p-3 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">Online Users</h2>

      {Object.keys(onlineUsers)
        .filter((id) => id !== currentUserId)
        .map((userId) => (
          <button
            key={userId}
            onClick={() => onSelect(userId)}
            className="block w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded mb-2"
          >
            User: {userId}
          </button>
        ))}
    </div>
  );
}
