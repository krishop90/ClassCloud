const Note = require("../models/noteModel");

// Upload a note
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No note file uploaded." });
    }

    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Save note to the database
    const note = new Note({
      title: req.body.title,
      filePath: req.file.path,
      uploadedBy: req.user._id, // Authenticated user ID
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Error during note upload:", error);
    res.status(500).json({ message: "Note upload failed", error: error.message });
  }
};

// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("uploadedBy", "username email") // Populate user info if needed
      .sort({ uploadDate: -1 }); // Sort by most recent first
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Failed to fetch notes", error: error.message });
  }
};

module.exports = { uploadNote, getAllNotes };
