import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../style/Lectures.css";
import AddLectureModal from "./AddLectureModal";
import VideoModal from "./VideoModal";

const Lectures = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const isSubmitting = useRef(false);

  // Inline Navigation component (can be customized)
  const Navigation = () => {
    return (
      <nav className="navigation">

      </nav>
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setUser({ token });
    }
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [searchQuery]);

  const fetchLectures = async () => {
    try {
      const response = await axios.get("/api/videos", {
        params: { query: searchQuery },
      });
      if (Array.isArray(response.data)) {
        // Log raw response before filtering
        console.log("Raw lectures response:", response.data);
        const uniqueLectures = new Map();
        response.data.forEach((lecture) => {
          uniqueLectures.set(lecture._id, lecture);
        });
        const filtered = Array.from(uniqueLectures.values());
        console.log("Filtered lectures:", filtered);
        setLectures(filtered);
      } else {
        setLectures([]);
      }
    } catch (error) {
      console.error("Error fetching lectures", error);
    }
  };

  const addLecture = async (newLecture, videoFile) => {
    if (isSubmitting.current) return; // prevent duplicate calls
    isSubmitting.current = true;
    console.log("Starting upload for:", newLecture);

    const formData = new FormData();
    formData.append("title", newLecture.title);
    formData.append("description", newLecture.description);
    formData.append("video", videoFile);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post("/api/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      console.log("Upload response:", response.data);
      // Re-fetch lectures after upload
      await fetchLectures();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding lecture", error);
      alert("Error uploading lecture, please try again.");
    } finally {
      isSubmitting.current = false;
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="lectures-container">
      <Navigation />
      <div className="lectures-header">
        <div className="lectures-header2">
          <h1>Lectures</h1>
          <p>Browse through your available lectures</p>
        </div>
        <input
          type="text"
          className="search"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
        />
        {user ? (
          <button className="add-lectures-btn" onClick={() => setIsModalOpen(true)}>
            + Add Lectures
          </button>
        ) : (
          <p>Please log in to add a lecture.</p>
        )}
      </div>

      <div className="grid-container">
        {lectures && Array.isArray(lectures) && lectures.length > 0 ? (
          lectures
            .filter((lecture) => lecture.title && lecture.description)
            .map((lecture) => (
              <div
                key={lecture._id}
                className="lecture-card"
                onClick={() => setSelectedLecture(lecture)}
              >
                <div className="lecture-image">
                  {lecture.thumbnail && (
                    <img src={`http://localhost:5001/thumbnail/${lecture.thumbnail}`} alt={lecture.title} />
                  )}
                </div>
                <div className="lecture-details">
                  <h2>{lecture.title}</h2>
                  <p>{lecture.description}</p>
                  <div className="lecture-meta">
                    <span>{lecture.uploadDate}</span> <span>{lecture.uploadTime}</span>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p>No lectures found</p>
        )}
      </div>

      {isModalOpen && <AddLectureModal onClose={() => setIsModalOpen(false)} onAddLecture={addLecture} />}
      {selectedLecture && <VideoModal lecture={selectedLecture} onClose={() => setSelectedLecture(null)} />}
    </div>
  );
};

export default Lectures;

