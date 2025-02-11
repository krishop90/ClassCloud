import React, { useState, useEffect } from "react";
import "../style/Notes.css";

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    file: null,
  });

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes"));
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }, [notes]);

  const handleAddNote = () => {
    const newNoteObject = {
      id: Date.now(),
      title: newNote.title,
      date: new Date().toISOString().split("T")[0],
      size: `${Math.floor(Math.random() * 10 + 1)}KB`,
      file: newNote.file ? URL.createObjectURL(newNote.file) : null,
      fileName: newNote.file ? newNote.file.name : null,
    };
    setNotes((prevNotes) => [...prevNotes, newNoteObject]);
    setNewNote({ title: "", file: null });
    setIsFormVisible(false);
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  return (
    <div className="notes-container">
      <div className="header-section">
        <div>
          <h1 className="notes-title">Notes</h1>
          <p className="notes-description">Manage and organize your notes easily.</p>
        </div>
        <input type="text" className="notes-search" placeholder="Search" />
        <button className="add-note-button" onClick={() => setIsFormVisible(true)}>
          + Add Note
        </button>
      </div>

      {isFormVisible && (
        <div className="full-page-modal">
          <div className="form-container">
            <div className="n-close">
            <h2>Add a New Note</h2>
            <button className="close-btn" onClick={() => setIsFormVisible(false)}>✖</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNote();
              }}
            >
              <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Attach File:</label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setNewNote({ ...newNote, file: e.target.files[0] })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  Save
                </button>
                <button type="button" className="cancel-button" onClick={() => setIsFormVisible(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="notes-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Size</th>
              <th>File</th>
              <th>Open</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id}>
                <td>{note.title}</td>
                <td>{note.date}</td>
                <td>{note.size}</td>
                <td>
                  {note.file ? (
                    <a href={note.file} download={note.fileName} target="_blank" rel="noopener noreferrer">
                      {note.fileName}
                    </a>
                  ) : (
                    "No file"
                  )}
                </td>
                <td>
                  {note.file ? (
                    <button className="open-button" onClick={() => window.open(note.file, "_blank")}>
                      Open
                    </button>
                  ) : (
                    "No file"
                  )}
                </td>
                <td>
                  <button className="delete-button" onClick={() => handleDeleteNote(note.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NotesApp;
