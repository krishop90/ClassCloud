import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/Notes.css";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newNote, setNewNote] = useState({
    title: "",
    file: null,
  });

  // Fetch notes from backend
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("/api/notes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle note upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("title", newNote.title);
      formData.append("note", newNote.file); // Make sure this matches the field name in multer

      console.log("Uploading file:", newNote.file); // Debug log

      const response = await axios.post("/api/notes/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      });

      console.log("Upload response:", response); // Debug log

      setNewNote({ title: "", file: null });
      setIsFormVisible(false);
      fetchNotes();
    } catch (error) {
      console.error("Error uploading note:", error);
      alert("Failed to upload note: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle note download
  const handleDownload = async (noteId, title) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please login to download notes");
        return;
      }

      const response = await axios({
        url: `/api/notes/download/${noteId}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Create blob from response
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });

      // Get filename from response headers or use title
      const disposition = response.headers['content-disposition'];
      const filename = disposition ?
        disposition.split('filename=')[1].replace(/"/g, '') :
        title;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();

    } catch (error) {
      console.error("Download error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Download failed: ${error.response.data.message || 'Unknown error'}`);
      } else {
        alert("Failed to download file. Please try again.");
      }
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`/api/notes/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (error) {
      console.error("Error searching notes:", error);
    }
  };

  return (
    <div className="notes-container">
      <div className="header-section">
        <div>
          <h1 className="notes-title">Notes</h1>
          <p className="notes-description">Share and access course notes</p>
        </div>
        <div className="search-section">
          <input
            type="text"
            className="notes-search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          className="add-note-button"
          onClick={() => setIsFormVisible(true)}
        >
          + Add Note
        </button>
      </div>

      {isFormVisible && (
        <div className="note-modal">
          <div className="n-modal-content">
            <form className="form-container">
              <div className="n-close">
                <h2>Upload New Note</h2>
                <button
                  className="n-close-button"
                  onClick={() => setIsFormVisible(false)}
                  type="button"
                >
                  ×
                </button>
              </div>

              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>File:</label>
                <input
                  type="file"
                  onChange={(e) => setNewNote({ ...newNote, file: e.target.files[0] })}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? "Uploading..." : "Upload"}
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
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note._id}>
                <td>{note.title}</td>
                <td>{note.uploadedBy?.username || 'Unknown'}</td>
                <td>{new Date(note.uploadDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(note._id, note.title)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notes;
