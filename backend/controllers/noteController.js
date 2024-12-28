const Note = require("../models/noteModel");

// Upload a note
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No note file uploaded." });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const note = new Note({
      title: req.body.title,
      filePath: req.file.path,
      uploadedBy: req.user._id, 
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Error during note upload:", error);
    res.status(500).json({ message: "Note upload failed", error: error.message });
  }
};

//download notes
const downloadNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const note = await Note.findById(noteId);

    if (!note) {
      console.error(`Note with ID ${noteId} not found`);
      return res.status(404).json({ message: "Note not found" });
    }

    const filePath = path.resolve(note.filePath);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath);
  } catch (error) {
    console.error("Error fetching note for download:", error);
    res.status(500).json({ message: "Failed to fetch note for download" });
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

module.exports = { uploadNote, getAllNotes , downloadNote};
