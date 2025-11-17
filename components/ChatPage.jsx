"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [msgInput, setMsgInput] = useState("");

  const chatMessages = messages[selectedUser] || [];

  // Generate user id
  useEffect(() => {
    const savedId = localStorage.getItem("userId");
    if (savedId) {
      setUserId(savedId);
    } else {
      const newId = "user-" + Math.floor(Math.random() * 99999);
      setUserId(newId);
      localStorage.setItem("userId", newId);
    }
  }, []);

  // Connect to socket
  useEffect(() => {
    if (!userId) return;

    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("connect", () => {
      s.emit("user-online", userId);
    });

    s.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    s.on("private-message", ({ senderId, message }) => {
      setMessages((prev) => ({
        ...prev,
        [senderId]: [
          ...(prev[senderId] || []),
          { senderId, message, incoming: true },
        ],
      }));
    });

    return () => {
      s.disconnect();
    };
  }, [userId]);

  const sendMessage = () => {
    if (!msgInput.trim() || !selectedUser) return;

    const msgObject = {
      senderId: userId,
      receiverId: selectedUser,
      message: msgInput,
    };

    socket.emit("send-private", msgObject);

    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [
        ...(prev[selectedUser] || []),
        { senderId: userId, message: msgInput, incoming: false },
      ],
    }));

    setMsgInput("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-72 bg-white shadow-sm p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-5 text-purple-700">Online Users</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {Object.keys(onlineUsers)
            .filter((id) => id !== userId)
            .map((id) => (
              <div
                key={id}
                onClick={() => setSelectedUser(id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border 
                  ${
                    selectedUser === id
                      ? "bg-purple-600 text-white border-purple-700 shadow"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                <div className="font-medium">{id}</div>
              </div>
            ))}
        </div>
      </div>

      {/* CHAT PANEL */}
      <div className="flex-1 flex flex-col">
        {/* Chat Top Bar */}
        <div className="p-4  bg-white sticky top-0 z-10">
          <h2 className="text-md text-gray-700">
            {selectedUser
              ? `Chat with: ${selectedUser}`
              : "Select a user to chat 😅"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-3">
            {chatMessages.map((m, index) => (
              <div
                key={index}
                className={`max-w-xs p-3 rounded-xl shadow-md text-sm break-words
                  ${
                    m.incoming
                      ? "bg-white text-gray-800 "
                      : "bg-purple-600 text-white ml-auto"
                  }`}
              >
                {m.message}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="p-4  bg-white flex items-center gap-3 sticky bottom-0">
            <input
              className="flex-1 p-3 border rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="Type a message..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="px-5 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
