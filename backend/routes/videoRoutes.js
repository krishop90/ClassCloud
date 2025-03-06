const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { protect } = require("../middleware/authMiddleware");
const { uploadVideoHandler, getAllVideos } = require("../controllers/videoController");


router.post("/upload", protect, upload.single("video"), uploadVideoHandler);

router.get("/", getAllVideos);

module.exports = router;
