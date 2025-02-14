const multer = require("multer");
const path = require("path");

//avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/; 
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only image files (jpeg, jpg, png) are allowed"));
    }
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notes');
  },
  filename: (req, file, cb) => {
    // Preserve the original file extension
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const uploadNote = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

module.exports = {uploadAvatar, uploadVideo, uploadNote };
