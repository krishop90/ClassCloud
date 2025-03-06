const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const { uploadNote, getAllNotes , downloadNote, searchNotes } = require("../controllers/noteController");

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

router.post("/upload", protect, upload.single("note"), uploadNote);

router.get("/download/:id", protect, downloadNote);

router.get("/", protect, getAllNotes);

router.get("/search", protect, searchNotes);

module.exports = router;
