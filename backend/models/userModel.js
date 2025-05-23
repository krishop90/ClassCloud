const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true, 
  },
  avatar: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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

userSchema.add({
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

module.exports = mongoose.model("User", userSchema);
