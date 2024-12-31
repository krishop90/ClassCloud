const express = require("express");
const router = express.Router();
const { uploadVideo } = require("../middleware/fileUploadMiddleware");
const { uploadVideo: uploadVideoHandler, getAllVideos, searchLectures } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");
const Video = require("../models/videoModel");
const path = require("path");
const fs = require("fs");

// Upload video route
router.post("/upload", protect, uploadVideo.single("video"), uploadVideoHandler);

// Get all videos
router.get("/", getAllVideos);

// Stream video
router.get("/stream/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      console.error("Video not found in database");
      return res.status(404).json({ message: "Video not found" });
    }

    const videoPath = path.resolve(video.videoPath);
    if (!fs.existsSync(videoPath)) {
      console.error("Video file not found at path:", videoPath);
      return res.status(404).json({ message: "Video file not found" });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        console.error("Invalid range requested:", start, end, fileSize);
        res.status(416).send("Requested range not satisfiable");
        return;
      }

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    res.status(500).json({ message: "Error streaming video", error: error.message });
  }
});

// Search lectures by title or uploader
router.get("/search", protect, searchLectures);

module.exports = router;
