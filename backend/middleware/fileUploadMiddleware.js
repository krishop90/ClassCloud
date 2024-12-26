const multer = require('multer');
const path = require('path');

// Set up storage for videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos');  // Save videos in 'uploads/videos'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});

// Initialize multer with the storage configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024,// 5 GB file size limit
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /mp4|mov|avi/;  // Allow video files only
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);  // If valid file type
    } else {
      cb('Error: Only video files are allowed');
    }
  }
});


module.exports = upload;  // Export the middleware for use in routes
