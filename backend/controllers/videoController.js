const Video = require("../models/videoModel");
const generateThumbnail = require("../utils/thumbnailGenerator");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const restrictedWords = ["movie", "series", "episode", "season"];

const uploadVideoHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated." });
    }
    const { title, description } = req.body;

    const containsRestrictedWord = restrictedWords.some((word) =>
      new RegExp(`\\b${word}\\b`, "i").test(title + " " + description)
    );
    if (containsRestrictedWord) {
      return res.status(400).json({ message: "Title or description contains restricted words." });
    }

    let videoDuration = 0;
    if (process.env.DISABLE_VIDEO_PROCESSING === 'true') {
      videoDuration = 0;
    } else {
      videoDuration = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(req.file.path, (err, metadata) => {
          if (err) {
            return reject(new Error('Video probe failed. Ensure ffprobe is installed and configured via FFPROBE_PATH or available on PATH.'));
          }
          resolve(metadata.format.duration);
        });
      });
    }
    if (videoDuration > 2400) {
      return res.status(400).json({ message: "Video duration exceeds the 40-minute limit." });
    }

    let thumbnailPath = null;
    const thumbnailDir = path.join(__dirname, "..", "uploads", "thumbnails");
    if (process.env.DISABLE_VIDEO_PROCESSING === 'true') {
      thumbnailPath = path.join(thumbnailDir, 'placeholder.jpg');
    } else {
      thumbnailPath = await generateThumbnail(req.file.path, thumbnailDir);
    }

    const newVideo = await Video.create({
      title,
      description,
      videoPath: req.file.path,
      thumbnail: thumbnailPath ? path.basename(thumbnailPath) : null,
      uploadedBy: req.user._id
    });
    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Upload Video Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const { query } = req.query; 
    const filter = {};
    if (query) {
      filter.title = { $regex: query, $options: "i" };
    }
    const videos = await Video.find(filter)
      .populate("uploadedBy", "username email")
      .sort({ uploadDate: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error("Get Videos Error:", error);
    res.status(500).json({ message: "Server error" });
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
      const user = await User.findOne({
        username: { $regex: uploadedBy, $options: "i" }
      });
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

module.exports = { uploadVideoHandler, getAllVideos, searchLectures };
