const express = require("express");
const http = require("http");
const socketIo = require("socket.io"); 
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const videoRoutes = require("./routes/videoRoutes"); 
const historyRoutes = require("./routes/historyRoutes");
const noteRoutes = require("./routes/noteRoutes");
const communityRoutes = require("./routes/communityRoutes"); 

const path = require("path");
const cors = require('cors');

// Initialize express app
const app = express();
const port = process.env.PORT || 5001;
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Socket.io setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5000', // Frontend URL (if served from localhost:5000)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

// Handle socket connections
io.on("connection", (socket) => {  // Change socketIo to io
  console.log("New client connected");

  // Handling message sending from client
  socket.on("sendMessage", (message) => {
    // Broadcast message to all users
    io.emit("receiveMessage", message);  // Change socketIo to io
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

//frontend
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Educonnect successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root Route
app.get("/", (req, res) => res.send("Educonnect server is running!"));

// Start Server
server.listen(port, () => console.log(`Server running on port ${port}`));
