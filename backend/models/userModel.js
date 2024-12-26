// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null }, // URL to the user's avatar/profile picture
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Role-based access
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  history: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "History",
  },
],
});

// Middleware to update `updatedAt` on each document save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check if the user is an admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

module.exports = mongoose.model("User", userSchema);
