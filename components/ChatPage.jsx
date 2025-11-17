import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(""); // current user
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  // Generate a fake user id for demo
  // You can replace with your auth system later
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

  // Connect to socket.io when userId is ready
  useEffect(() => {
    if (!userId) return;

    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("connect", () => {
      // Announce yourself to the server
      s.emit("user-online", userId);
    });

    // receive updated list of online users
    s.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    // receive private messages
    s.on("private-message", ({ senderId, message }) => {
      setMessages((prev) => [...prev, { senderId, message, incoming: true }]);
    });

    return () => {
      s.disconnect();
    };
  }, [userId]);

  // send message
  const sendMessage = () => {
    if (!msgInput.trim() || !selectedUser) return;

    const msgObject = {
      senderId: userId,
      receiverId: selectedUser,
      message: msgInput,
    };

    socket.emit("send-private", msgObject);

    setMessages((prev) => [
      ...prev,
      { senderId: userId, message: msgInput, incoming: false },
    ]);

    setMsgInput("");
  };

  return (
    <div className="flex h-screen">
      {/* LEFT: Online users */}
      <div className="w-64 border-r border-gray-300 p-4">
        <h2 className="text-lg font-bold mb-3">Online Users</h2>

        {Object.keys(onlineUsers)
          .filter((id) => id !== userId)
          .map((id) => (
            <div
              key={id}
              className={`p-2 cursor-pointer rounded mb-2 
                ${
                  selectedUser === id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
                }`}
              onClick={() => setSelectedUser(id)}
            >
              {id}
            </div>
          ))}
      </div>

      {/* RIGHT: Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            Chat with: {selectedUser || "No one yet 😅"}
          </h2>

          <div className="space-y-3">
            {messages
              .filter((m) => m.senderId === selectedUser || !m.incoming)
              .map((m, index) => (
                <div
                  key={index}
                  className={`p-2 rounded max-w-sm ${
                    m.incoming
                      ? "bg-gray-300 text-black"
                      : "bg-purple-600 text-white ml-auto"
                  }`}
                >
                  {m.message}
                </div>
              ))}
          </div>
        </div>

        {/* Message input */}
        {selectedUser && (
          <div className="flex p-3 border-t">
            <input
              className="flex-1 p-2 border rounded"
              placeholder="Say something..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-purple-600 text-white rounded"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
