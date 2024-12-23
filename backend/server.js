const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");
const friendRoutes = require("./routes/friendRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Route Middleware
app.use("/api/profile", profileRoutes);
app.use("/api/users", authRoutes);
app.use("/api/friends", friendRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Educonnect successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root Route
app.get("/", (req, res) => res.send("Educonnect server is running!"));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
