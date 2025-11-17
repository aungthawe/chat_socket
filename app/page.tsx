"use client";
import Navbar from "@/components/Navbar";
import ChatPage from "@/components/ChatPage";

//let socket: Socket | null = null;

export default function Page() {
  // const [currentUserId] = useState(() => {
  //   return "user-" + Math.floor(Math.random() * 10000);
  // });

  // const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  // const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // useEffect(() => {
  //   socket = io("http://localhost:4000");

  //   socket.on("connect", () => {
  //     socket?.emit("user-online", currentUserId);
  //   });

  //   socket.on("online-users", (users) => {
  //     setOnlineUsers(users);
  //   });

  //   return () => {
  //     socket?.disconnect();
  //   };
  // }, []);

  return (
    <div className=" min-h-screen">
      <Navbar />

      {/* <OnlineUserList
        onlineUsers={onlineUsers}
        onSelect={setSelectedUserId}
        currentUserId={currentUserId}
      />
      
    
      <ChatBox currentUserId={currentUserId} receiverId={selectedUserId} /> */}

      <ChatPage />
    </div>
  );
}
