const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Referring to User model (ensure it exists and is correctly configured)
    required: true,
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video", // Referring to Video model (ensure it exists and is correctly configured)
    required: true,
  },
  watchedAt: {
    type: Date,
    default: Date.now,  // Automatically sets the current date and time when the history is created
  },
  watchDuration: {
    type: Number,
    default: 0,  // Default is 0, can be updated with the actual watch duration
  },
  completed: {
    type: Boolean,
    default: false,  // This can be updated based on whether the video was fully watched
  },
});

module.exports = mongoose.model("History", historySchema, "history"); // Model "History" linked to the "history" collection
