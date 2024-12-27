const express = require("express");
const router = express.Router();
const {uploadVideo}= require("../middleware/fileUploadMiddleware");
const { uploadVideo : uploadVideoHandler} = require("../controllers/videoController");
const authenticate = require('../middleware/authMiddleware');
const { protect } = require("../middleware/authMiddleware");
const { getAllVideos } = require("../controllers/videoController");
// Upload video route
router.post("/upload", protect, uploadVideo.single('video'), uploadVideoHandler);

router.get("/", getAllVideos);

module.exports = router;
