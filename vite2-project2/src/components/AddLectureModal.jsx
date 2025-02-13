import React, { useState } from "react";
import "../style/AddLectureModal.css";
import axios from "axios";

const AddLectureModal = ({ onClose, onAddLecture }) => {
  const [newLecture, setNewLecture] = useState({ title: "", description: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoDuration, setVideoDuration] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Enforce 500MB size limit
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 500) {
      alert("File size is too large! Please select a file under 500MB.");
      return;
    }

    setVideoFile(file);

    // Extract video duration
    const videoURL = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoURL;

    video.onloadedmetadata = () => {
      const durationSeconds = video.duration;
      if (durationSeconds > 45 * 60) {
        alert("Video duration exceeds 45 minutes. Please upload a shorter video.");
        setVideoFile(null);
        return;
      }
      setVideoDuration(formatDuration(durationSeconds));
    };
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs > 0 ? `${hrs}:` : ""}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    setUploading(true);
    await onAddLecture(newLecture, videoFile);
    setUploading(false);
  };

  return (
    <div className="full-page-modal">
      <div className="modal-form-container">
        <div className="modal-header">
          <h2>Add Lecture</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>Lecture Name:</label>
          <input
            type="text"
            value={newLecture.title}
            onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
            required
          />

          <label>Description:</label>
          <textarea
            value={newLecture.description}
            onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
            required
          />

          <label>Select Lecture File:</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            required
          />

          {videoDuration && <p>Video Length: {videoDuration}</p>}

          <div className="modal-buttons">
            <button type="submit" className="save-btn" disabled={uploading}>
              {uploading ? "Uploading..." : "Save"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLectureModal;
