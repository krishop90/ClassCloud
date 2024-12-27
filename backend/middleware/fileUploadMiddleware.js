const multer = require("multer");
const path = require("path");

//avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars"); // Save avatars in 'uploads/avatars'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit avatar size to 5MB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/; // Allow JPEG, JPG, PNG files
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only image files (jpeg, jpg, png) are allowed"));
    }
  },
});

// Set up storage for videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos"); // Save videos in 'uploads/videos'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 3 * 1024 * 1024 * 1024, // 3 GB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /mp4|mov|avi/; // Allow video files only
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only video files are allowed"));
    }
  },
});

// Set up storage for notes
const noteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/notes"); // Save notes in 'uploads/notes'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const uploadNote = multer({
  storage: noteStorage,
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1 GB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|ppt|pptx|txt/; // Allow PDF and PPT files only
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only PDF and PPT files are allowed"));
    }
  },
});

module.exports = {uploadAvatar, uploadVideo, uploadNote };
