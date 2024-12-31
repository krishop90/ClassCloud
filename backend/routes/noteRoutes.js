const express = require("express");
const router = express.Router();
const Note = require("../models/noteModel");
const fs = require("fs");
const path = require("path");
const { uploadNote: uploadMiddleware } = require("../middleware/fileUploadMiddleware");
const { uploadNote, getAllNotes , downloadNote} = require("../controllers/noteController");
const { protect } = require("../middleware/authMiddleware");
const { searchNotes } = require("../controllers/noteController");
// Upload note route
router.post("/upload", protect, uploadMiddleware.single("note"), uploadNote);


//Download note route
router.get("/download/:id", protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const filePath = path.join(__dirname, "..", note.filePath);
    res.download(filePath, note.title, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    console.error("Error fetching note for download:", error);
    res.status(500).json({ message: "Failed to fetch note for download" });
  }
});

// Get all notes route
router.get("/", getAllNotes);


// Search notes route
router.get("/search", protect, searchNotes);

module.exports = router;
