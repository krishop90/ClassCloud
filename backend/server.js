const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const axios = require("axios");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const videoRoutes = require("./routes/videoRoutes");
const historyRoutes = require("./routes/historyRoutes");
const noteRoutes = require("./routes/noteRoutes");
const communityRoutes = require("./routes/communityRoutes");
const eventRoutes = require("./routes/eventRoutes");
const workRoutes = require("./routes/workRoutes");
const activityRoutes = require("./routes/activityRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const FAQ = require("./models/faqModel"); 
const ChatHistory = require("./models/chatHistoryModel"); 
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const uploadDir = path.join(__dirname, 'uploads/notes');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadDirs = ['uploads/notes', 'uploads/videos', 'uploads/avatars'];

uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const app = express();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filepath) => {
    const ext = path.extname(filepath).toLowerCase();
    if (ext === '.pptx') {
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    }
  }
}));

// Socket.io 
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

// Track connected sockets
const connectedSockets = new Map();

io.on("connection", (socket) => {
  console.log(`New client connected [ID: ${socket.id}]`);
  connectedSockets.set(socket.id, { connected: true, lastPing: Date.now() });

  // Handle ping
  socket.on('ping', () => {
    connectedSockets.get(socket.id).lastPing = Date.now();
    socket.emit('pong');
  });

  socket.on("error", (error) => {
    console.error(`Socket Error [ID: ${socket.id}]:`, error);
    socket.emit("error", "Internal server error");
  });

  socket.on("askChatbot", async (message) => {
    try {
      const faq = await FAQ.findOne({ question: message });
      if (faq) {
        return socket.emit("botReply", faq.answer);
      }

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
        {
          contents: [{ role: "user", parts: [{ text: message }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: process.env.GEMINI_API_KEY },
        }
      );

      const botReply =
        response.data.candidates[0]?.content?.parts[0]?.text ||
        "I couldn't find an answer.";

      await ChatHistory.create({ userMessage: message, botReply });

      socket.emit("botReply", botReply);
    } catch (error) {
      console.error("Chatbot Error:", error);
      socket.emit("botReply", "Sorry, something went wrong.");
    }
  });

  socket.on("joinCommunity", (communityId, username) => {
    try {
      console.log(`${username} joined the ${communityId} room`);
      socket.join(communityId);
      socket.emit("joinedCommunity", { status: "success", communityId });
    } catch (error) {
      console.error(`Error joining community: ${error}`);
      socket.emit("error", "Failed to join community");
    }
  });

  socket.on("sendMessage", (data) => {
    const { communityId, message, senderId, senderName } = data;
    console.log(`Sending message to ${communityId} room from ${senderName}: ${message}`);
  
    const messageData = {
      communityId,
      text: message,
      senderId,
      senderName,
      timestamp: new Date(),
    };
  
    io.to(communityId).emit("receiveMessage", messageData);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected [ID: ${socket.id}] Reason: ${reason}`);
    connectedSockets.delete(socket.id);
    
    // Leave all rooms
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
  });
});

// Cleanup stale connections periodically
setInterval(() => {
  const now = Date.now();
  connectedSockets.forEach((data, socketId) => {
    if (now - data.lastPing > 70000) { // 70 seconds
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        console.log(`Closing stale connection [ID: ${socketId}]`);
        socket.disconnect(true);
      }
      connectedSockets.delete(socketId);
    }
  });
}, 30000);

// Error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});

app.use("/api/community", communityRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", authRoutes);
app.use('api/update-password', profileRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/notes", noteRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/events", eventRoutes);
app.use("/api/work", workRoutes);
app.use("/api/user", activityRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/thumbnail", express.static(path.join(__dirname, "uploads", "thumbnails")));
app.use('/api/activity', activityRoutes);


app.use(express.static(path.join(__dirname, "vite2-project2", "public")));
app.use("thumbnail", express.static(path.join(__dirname, "uploads", "thumbnails")));


app.use("/thumbnail", express.static(path.join(__dirname, "uploads", "thumbnails")));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.get("/", (req, res) => res.send("Educonnect server is running!"));

server.listen(port, () => console.log(`Server running on port ${port}`));
