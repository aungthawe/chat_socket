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

let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Current map:", onlineUsers);
  console.log("User connected:", socket.id);

  socket.on("user-online", ({ name, image }) => {
  onlineUsers[name] = { socketId: socket.id, image };
  io.emit("online-users", onlineUsers);
  console.log("online-uses: "+ onlineUsers);

  socket.on("typing", ({ senderId, receiverId }) => {
  const receiverSocketId = onlineUsers[receiverId]?.socketId || onlineUsers[receiverId];
  //console.log("typing user:"+ senderId + ",to receiver:"+ receiverId + ": socket_ID : "+ receiverSocketId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("typing", { senderId });
  }
});

});


socket.on("send-private", ({ senderId, receiverId,message }) => {
  console.log("Message received on server:");
  console.log("Sender:", senderId);
  console.log("Receiver:", receiverId);
  // console.log("Sent At: "+ sentAt);
  //console.log("OnlineUsers map:", onlineUsers);

  const receiverSocketId = onlineUsers[receiverId].socketId;
  console.log("Resolved socket ID:", receiverSocketId);

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("private-message", {
      senderId,
      message,
   
    });
  }
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);



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
