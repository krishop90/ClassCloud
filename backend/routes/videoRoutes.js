const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { protect } = require("../middleware/authMiddleware");
const { uploadVideoHandler, getAllVideos } = require("../controllers/videoController");

// Upload video route: call the controller directly
router.post("/upload", protect, upload.single("video"), uploadVideoHandler);

// Get all videos
router.get("/", getAllVideos);

// (Other routes here)

module.exports = router;
