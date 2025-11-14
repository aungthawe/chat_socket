// server.js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

// ─────────────────────────────────────────────
// IN-MEMORY DATA STRUCTURES
// ─────────────────────────────────────────────

// userId (email) → socketId
const onlineUsers = new Map();

// conversationKey → [messages]
const messages = new Map();

/** Create a unique conversation key regardless of order */
function getConversationKey(user1, user2) {
  return [user1, user2].sort().join("__");
}

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // ─────────────────────────────────────────────
  // JOIN EVENT
  // ─────────────────────────────────────────────
  socket.on("join", ({ userId }) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    console.log(`User joined: ${userId}`);

    // Notify all clients about online users
    io.emit("presence:update", Array.from(onlineUsers.keys()));
  });

  // ─────────────────────────────────────────────
  // LOAD MESSAGE HISTORY
  // ─────────────────────────────────────────────
  socket.on("conversation:load", ({ userId, otherUserId }) => {
    const key = getConversationKey(userId, otherUserId);
    const history = messages.get(key) || [];
    socket.emit("conversation:history", history);
  });

  // ─────────────────────────────────────────────
  // SEND DIRECT MESSAGE
  // ─────────────────────────────────────────────
  socket.on("message:send", (data) => {
    const { id, content, sender, recipientId, createdAt } = data;

    if (!sender || !recipientId || !content) return;

    const conversationKey = getConversationKey(sender.id, recipientId);

    const msg = {
      id,
      content,
      sender,
      recipientId,
      createdAt,
      conversationId: conversationKey,
    };

    // Save message in history
    if (!messages.has(conversationKey)) messages.set(conversationKey, []);
    messages.get(conversationKey).push(msg);

    // Deliver to users
    const senderSocketId = onlineUsers.get(sender.id);
    const recipientSocketId = onlineUsers.get(recipientId);

    if (senderSocketId) io.to(senderSocketId).emit("message:receive", msg);
    if (recipientSocketId) io.to(recipientSocketId).emit("message:receive", msg);

    console.log(`💬 ${sender.id} → ${recipientId}: ${content}`);
  });

  // ─────────────────────────────────────────────
  // DISCONNECT
  // ─────────────────────────────────────────────
  socket.on("disconnect", () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("presence:update", Array.from(onlineUsers.keys()));
    console.log("🔴 Disconnected:", socket.id);
  });
});

httpServer.listen(3001, () =>
  console.log("🚀 Socket server running on http://localhost:3001")
);
