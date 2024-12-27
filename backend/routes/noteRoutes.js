const express = require("express");
const router = express.Router();
const { uploadNote: uploadMiddleware } = require("../middleware/fileUploadMiddleware");
const { uploadNote, getAllNotes } = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");

// Upload note route
router.post("/upload", protect, uploadMiddleware.single("note"), uploadNote);

// Get all notes route
router.get("/", getAllNotes);

module.exports = router;
