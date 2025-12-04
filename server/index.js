const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://cryptoria-23fa5.web.app",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket"],
});


// ✅ REAL-TIME CONNECTION
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


  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ✅ START SERVER
server.listen(5000, () => {
  console.log("Socket server running on http://localhost:5000");
});
