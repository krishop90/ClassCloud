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

const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

// Socket.io setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Real-time chatbot integration
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

  // Community chat features
  socket.on("joinCommunity", (communityId, username) => {
    console.log(`${username} joined the ${communityId} room`);
    socket.join(communityId);
  });

  socket.on("sendMessage", (communityId, message) => {
    console.log(`Sending message to ${communityId} room: ${message}`);
    io.to(communityId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Route Middleware
app.use("/api/community", communityRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", authRoutes);
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

// Frontend
app.use(express.static(path.join(__dirname, "frontend", "public")));
app.use("thumbnail", express.static(path.join(__dirname, "uploads", "thumbnails")));

// Serve thumbnails correctly
app.use("/thumbnail", express.static(path.join(__dirname, "uploads", "thumbnails")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root Route
app.get("/", (req, res) => res.send("Educonnect server is running!"));

// Start Server
server.listen(port, () => console.log(`Server running on port ${port}`));
