import React from "react";
import "../style/VideoModal.css";

const VideoModal = ({ lecture, onClose }) => {
  return (
    <div className="full-page-modal">
      <div className="modal-form-container">
        <div className="modal-header">
          <h2>{lecture.title}</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>
        <p>{lecture.description}</p>

        <div className="video-container">
          <video width="100%" controls>
            <source src={`http://localhost:5001/${lecture.videoPath}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
