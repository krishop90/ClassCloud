const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const { uploadNote, getAllNotes , downloadNote, searchNotes } = require("../controllers/noteController");

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notes')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload note route
router.post("/upload", protect, upload.single("note"), uploadNote);

// Download note route
router.get("/download/:id", protect, downloadNote);

// Get all notes route
router.get("/", protect, getAllNotes);

// Search notes route
router.get("/search", protect, searchNotes);

module.exports = router;
