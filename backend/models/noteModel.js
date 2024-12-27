const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Note title
  filePath: { type: String, required: true }, // Path to the note file
  uploadDate: { type: Date, default: Date.now }, // Default to current date
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to user
});

module.exports = mongoose.model("Note", noteSchema); // Model "Note"
