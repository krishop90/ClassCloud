const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUploadMiddleware");
const { uploadVideo } = require("../controllers/videoController");
const authenticate = require('../middleware/authMiddleware');
const { protect } = require("../middleware/authMiddleware");

// Upload video route
router.post("/upload", protect, upload.single('video'), uploadVideo);

module.exports = router;
