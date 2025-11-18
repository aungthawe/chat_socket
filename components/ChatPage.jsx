"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { stringify } from "querystring";

export default function ChatPage() {
  const { data: session } = useSession();

  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [msgInput, setMsgInput] = useState("");

  const chatMessages = messages[selectedUser] || [];
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setUserId(session?.user.name);
      setProfileImage(session?.user?.image);
    }
  }, [session]);

  // Connect to socket
  useEffect(() => {
    if (!userId) return;

    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("connect", () => {
      s.emit("user-online", {
        name: session?.user?.name,
        image: session?.user?.image,
      });
    });

    s.on("online-users", (users) => {
      setOnlineUsers(users);
      console.log(users);
    });

    s.on("private-message", ({ senderId, message }) => {
      setMessages((prev) => ({
        ...prev,
        [senderId]: [
          ...(prev[senderId] || []),
          {
            senderId,
            message,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            image: onlineUsers[senderId]?.image,
            incoming: true,
          },
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
      // sentAt: time,
      message: msgInput,
    };

    socket.emit("send-private", msgObject);
    let time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [
        ...(prev[selectedUser] || []),
        {
          senderId: userId,
          message: msgInput,
          time,
          image: profileImage,
          incoming: false,
        },
      ],
    }));

    setMsgInput("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-72 bg-purple-100 shadow-sm p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-5 text-purple-700">Online Users</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {Object.entries(onlineUsers)
            .filter(([name]) => name !== userId && name !== "undefined")
            .map(([name, data]) => (
              <div
                key={name}
                onClick={() => setSelectedUser(name)}
                className={`flex item-center gap-3 mb-2 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedUser === name
                    ? "bg-purple-600 text-white "
                    : "bg-gray-200 hover:bg-gray-300 transition-color"
                }`}
              >
                <img
                  src={data.image}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{name}</span>
              </div>
            ))}
        </div>
      </div>

      {/* CHAT PANEL */}
      <div className="flex-1 flex flex-col">
        {/* Chat Top Bar */}
        <div className="p-4  bg-gray-50 sticky top-0 z-10">
          <h2
            className={`text-md text-gray-700 ${
              selectedUser ? "font-md" : "text-center mt-2"
            }`}
          >
            {selectedUser ? `${selectedUser}` : "Select a user to chat "}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {chatMessages.map((m, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${
                  m.incoming ? "justify-start" : "justify-end"
                }`}
              >
                {/* Incoming avatar */}
                {m.incoming && (
                  <img
                    src={m.image}
                    className="w-8 h-8 rounded-full object-cover mt-1"
                  />
                )}

                {/* MESSAGE BUBBLE */}
                <div
                  className={`max-w-xs p-3 text-sm shadow-md break-words
          ${
            m.incoming
              ? "bg-purple-200 text-gray-900 message-bubble-received"
              : "bg-purple-600 text-white message-bubble-sent"
          }
        `}
                >
                  <div className="text-[10px]  mb-1">
                    {m.senderId} • {m.time}
                  </div>

                  <div>{m.message}</div>
                </div>

                {/* Outgoing avatar */}
                {!m.incoming && (
                  <img
                    src={m.image}
                    className="w-8 h-8 rounded-full object-cover mt-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="p-4  bg-white flex justify-start gap-3 items-center  sticky bottom-0">
            <input
              className="p-3 rounded-xl bg-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
              placeholder="Type a message..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="px-5 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition-color"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
