const Video = require("../models/videoModel");
const generateThumbnail = require("../utils/thumbnailGenerator");
const ffmpeg = require("fluent-ffmpeg");


// Restricted words
const restrictedWords = ["movie", "series" , "episode" , "season"];

// Upload video and generate thumbnail
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const { title, description } = req.body;

    // Check for restricted words in title and description
    const containsRestrictedWord = restrictedWords.some((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(title + " " + description)
    );
    if (containsRestrictedWord) {
      return res
        .status(400)
        .json({ message: "Title or description contains restricted words." });
    }

    // Check video duration (max: 40 minutes)
    const videoDuration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(req.file.path, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration);
      });
    });

    if (videoDuration > 2400) {
      return res
        .status(400)
        .json({ message: "Video duration exceeds the 40-minute limit." });
    }

    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(req.file.path, "uploads/thumbnails");

    // Save video data
    const video = new Video({
      title,
      description,
      videoPath: req.file.path,
      thumbnail: thumbnailPath,
      uploadedBy: req.user._id,
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error("Error during video upload:", error);
    res.status(500).json({ message: "Video upload failed", error: error.message });
  }
};
const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("uploadedBy", "username email") 
      .sort({ uploadDate: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos", error: error.message });
  }
};

const searchLectures = async (req, res) => {
  try {
    const { query, uploadedBy } = req.query;
    const filter = {};

    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }

    if (uploadedBy) {
      const user = await User.findOne({ username: { $regex: uploadedBy, $options: "i" } });
      if (user) {
        filter.uploadedBy = user._id;
      } else {
        return res.status(404).json({ message: "Uploader not found" });
      }
    }

    const lectures = await Video.find(filter).populate("uploadedBy", "username email");
    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ message: "Error searching lectures", error: error.message });
  }
};


module.exports = { uploadVideo , getAllVideos , searchLectures};
