const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Note", noteSchema);
