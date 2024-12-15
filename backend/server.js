const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Educonnect successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", require("./routes/authRoutes"));

// Test Route
app.get("/", (req, res) => {
  res.send("Educonnect server is running!");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
