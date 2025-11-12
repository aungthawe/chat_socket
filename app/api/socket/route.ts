import { Server } from "socket.io";
import { NextRequest } from "next/server";

declare global {
  // 👇 Add a type-safe global variable
  var io: Server | undefined;
}

export async function GET(req: NextRequest) {
  if (!global.io) {
    const io = new Server(3001, {
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log(" New client connected:", socket.id);

      socket.on("send_message", (msg) => {
        io.emit("receive_message", msg);
      });

      socket.on("disconnect", () => {
        console.log(" Client disconnected");
      });
    });

    global.io = io; // <-- Type-safe now
    console.log("⚡ Socket.io server started on port 3001");
  }

  return new Response("Socket server is running");
}
