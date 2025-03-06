const Note = require("../models/noteModel");
const path = require('path');
const fs = require('fs');  

const uploadNote = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newNote = new Note({
      title: req.body.title,
      filePath: req.file.path,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    });

    await newNote.save();
    res.status(201).json({ message: "Note uploaded successfully" });
  } catch (error) {
    console.error("Error in uploadNote:", error); 
    res.status(500).json({ 
      message: "Error uploading note",
      error: error.message 
    });
  }
};

const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const filePath = path.join(__dirname, '..', note.filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ message: "File not found on server" });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.txt': 'text/plain'
    };
    
    res.set({
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
    });

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Send file error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error sending file" });
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("uploadedBy", "username email") 
      .sort({ uploadDate: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes", error: error.message });
  }
};

const searchNotes = async (req, res) => {
  try {
    const { query } = req.query; 
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const notes = await Note.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, 
        { uploadedBy: { $regex: query, $options: "i" } } 
      ]
    })
      .populate("uploadedBy", "username email") 
      .sort({ uploadDate: -1 });

    if (notes.length === 0) {
      return res.status(404).json({ message: "No notes found matching the query" });
    }

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error during note search:", error);
    res.status(500).json({ message: "Failed to search notes", error: error.message });
  }
};

module.exports = { uploadNote, getAllNotes , downloadNote , searchNotes};
