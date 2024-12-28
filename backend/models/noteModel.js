const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  filePath: { type: String, required: true }, 
  uploadDate: { type: Date, default: Date.now }, 
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
});

module.exports = mongoose.model("Note", noteSchema); // Model "Note"
