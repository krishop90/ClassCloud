const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },  
  description: { type: String },  
  videoPath: { type: String, required: true },  
  thumbnail: { type: String }, 
  uploadDate: { type: Date, default: Date.now }, 
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Video", videoSchema); 
