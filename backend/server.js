const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");
const videoRoutes = require("./routes/videoRoutes"); 
const historyRoutes = require("./routes/historyRoutes");
const noteRoutes = require("./routes/noteRoutes");


const path = require("path");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Route Middleware
app.use("/api/profile", profileRoutes);
app.use("/api/users", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/notes", noteRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Educonnect successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root Route
app.get("/", (req, res) => res.send("Educonnect server is running!"));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));


