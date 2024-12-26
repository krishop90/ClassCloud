const Video = require("../models/videoModel");
const generateThumbnail = require("../utils/thumbnailGenerator");

// Upload video and generate thumbnail
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(req.file.path, "uploads/thumbnails");

    // Save video to the database
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      videoPath: req.file.path,
      thumbnail: thumbnailPath,
      uploadedBy: req.user._id,  // Use req.user._id (authenticated user ID)
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error("Error during video upload:", error);  // Log the error for debugging
    res.status(500).json({ message: "Video upload failed", error: error.message });
  }
};

module.exports = { uploadVideo };
