import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("user_join", (username) => {
    onlineUsers.set(socket.id, username);
    io.emit("users_update", Array.from(onlineUsers.values()));
    io.emit("receive_message", {
      author: "System",
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", {
      ...data,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("user_typing", username);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("user_stop_typing");
  });

  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit("users_update", Array.from(onlineUsers.values()));
    if (username) {
      io.emit("receive_message", {
        author: "System",
        message: `${username} left the chat`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  });
});

const frontendBuild = path.join(__dirname, "../chat-frotend/build");
app.use(express.static(frontendBuild));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(frontendBuild, "index.html"));
});

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
