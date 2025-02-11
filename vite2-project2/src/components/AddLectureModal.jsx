import React, { useState } from "react";
import "../style/AddLectureModal.css";
import axios from "axios";

const AddLectureModal = ({ onClose, onAddLecture }) => {
  const [lectureName, setLectureName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState("");
  const [loading, setLoading] = useState(false); // For loading state

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Enforce 500MB size limit
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 500) {
      alert("File size is too large! Please select a file under 500MB.");
      return;
    }

    setSelectedFile(file);

    // Extract video duration
    const videoURL = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = videoURL;

    video.onloadedmetadata = () => {
      const durationSeconds = video.duration;
      if (durationSeconds > 45 * 60) {
        alert("Video duration exceeds 45 minutes. Please upload a shorter video.");
        setSelectedFile(null);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!lectureName || !selectedFile) {
      alert("Please fill in all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", lectureName);
    formData.append("description", description);
    formData.append("video", selectedFile);

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      localStorage.setItem("authToken", token);
      const response = await axios.post("http://localhost:5001/api/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      onAddLecture(response.data, selectedFile);
      onClose();
    } catch (error) {
      console.error("Error uploading lecture", error);
      alert("Error uploading lecture, please try again.");
    } finally {
      setLoading(false);
    }
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
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)}
            required
          />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Uploading..." : "Save"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
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
