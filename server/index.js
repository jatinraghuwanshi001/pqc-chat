const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors({
  origin: "https://cryptoria-23fa5.web.app",
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Socket server running");
});

const server = http.createServer(app);

// ✅ IMPORTANT FOR RAILWAY
const io = new Server(server, {
  cors: {
    origin: "https://cryptoria-23fa5.web.app",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket"]
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log("🟢 Joined:", chatId);
  });

  socket.on("send-message", (msg) => {
    console.log("📩 Message from:", msg.chatId);
    socket.to(msg.chatId).emit("receive-message", msg);
  });

  socket.on("session-key", (data) => {
    socket.to(data.chatId).emit("session-key", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ RAILWAY DEPLOY PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("✅ Socket server listening on", PORT));
