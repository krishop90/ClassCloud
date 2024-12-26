const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },  // Video title
  description: { type: String },  // Video description
  videoPath: { type: String, required: true },  // Path where video is stored
  thumbnail: { type: String },  // Path to the thumbnail image (optional)
  uploadDate: { type: Date, default: Date.now },  // Default to current date when video is uploaded
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Reference to the User model
});

module.exports = mongoose.model("Video", videoSchema);  // Model "Video" for videos collection
