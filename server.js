// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// STORE ONLINE USERS
// { userId: socketId }
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Current map:", onlineUsers);
  console.log("User connected:", socket.id);

  // WHEN USER LOGS IN
  socket.on("user-online", (userId) => {
    onlineUsers[userId] = socket.id;

    io.emit("online-users", onlineUsers); // SEND UPDATED LIST TO EVERYONE
    console.log("Online Users:", onlineUsers);
  });

  // SEND PRIVATE MESSAGE
socket.on("send-private", ({ senderId, receiverId, message }) => {
  console.log("Message received on server:");
  console.log("Sender:", senderId);
  console.log("Receiver:", receiverId);
  console.log("OnlineUsers map:", onlineUsers);

  const receiverSocketId = onlineUsers[receiverId];
  console.log("Resolved socket ID:", receiverSocketId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("private-message", {
      senderId,
      message,
    });
  }
});


  // WHEN USER DISCONNECTS
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);


    // REMOVE USER FROM ONLINE LIST
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }

    io.emit("online-users", onlineUsers);
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));
