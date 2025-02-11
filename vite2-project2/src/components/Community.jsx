import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../style/Community.css";

const Community = () => {
  const [communities, setCommunities] = useState(() => {
    const savedCommunities = localStorage.getItem("communities");
    return savedCommunities ? JSON.parse(savedCommunities) : [];
  });

  const [yourCommunities, setYourCommunities] = useState(() => {
    const savedYourCommunities = localStorage.getItem("yourCommunities");
    return savedYourCommunities ? JSON.parse(savedYourCommunities) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    localStorage.setItem("communities", JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem("yourCommunities", JSON.stringify(yourCommunities));
  }, [yourCommunities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCommunity({ ...newCommunity, [name]: value });
  };

  const handleAddCommunity = () => {
    if (newCommunity.name && newCommunity.description) {
      const updatedCommunity = {
        id: Date.now(), // Ensure unique ID using timestamp
        name: newCommunity.name,
        members: 1,
        description: newCommunity.description,
      };
      setCommunities([...communities, updatedCommunity]);
      setNewCommunity({ name: "", description: "" });
      setShowModal(false);
    }
  };

  const handleJoinClick = (community) => {
    setSelectedCommunity(community);
    setJoinModal(true);
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleJoinCommunity = () => {
    if (userInfo.name && userInfo.email && selectedCommunity) {
      // Remove the community from available list
      const updatedCommunities = communities.filter(
        (community) => community.id !== selectedCommunity.id
      );
      setCommunities(updatedCommunities);

      // Add to Your Communities
      setYourCommunities([
        ...yourCommunities,
        { ...selectedCommunity, members: selectedCommunity.members + 1 },
      ]);

      localStorage.setItem("communities", JSON.stringify(updatedCommunities));
      localStorage.setItem(
        "yourCommunities",
        JSON.stringify([
          ...yourCommunities,
          { ...selectedCommunity, members: selectedCommunity.members + 1 },
        ])
      );

      // Reset modal
      setJoinModal(false);
      setUserInfo({ name: "", email: "" });
    }
  };

  return (
    <div className="app-container">
      <div className="community-section">
        <div className="community-header">
          <div className="community-header2">
            <h1>Community</h1>
            <p>Discover and register for upcoming events</p>
          </div>
          <input type="text" className="community-search" placeholder="Search" />
          <button className="add-community-btn" onClick={() => setShowModal(true)}>
            + Add Community
          </button>
        </div>

        <div className="community-list">
          {communities.map((community) => (
            <div key={community.id} className="community-card">
              <div className="community-avatar" />
              <div className="community-info">
                <h2>{community.name}</h2>
                <p>{community.members} members</p>
                <p>{community.description}</p>
              </div>
              <button
                className="join-btn"
                onClick={() => handleJoinClick(community)}
                disabled={yourCommunities.some((c) => c.id === community.id)}
              >
                {yourCommunities.some((c) => c.id === community.id) ? "Joined" : "Join Now"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="your-community-section">
        <h2>Your Community</h2>
        <hr />
        <div className="your-community-list">
          {yourCommunities.map((community) => (
            <div key={community.id} className="your-community-item">
              <div className="community-avatar2" />
              <span>{community.name}</span>
              <Link to={`/chat/${community.id}`} className="chat-btn">
                Chat
              </Link>
            </div>
          ))}
        </div>
        <hr />
      </div>

      {showModal && (
        <div className="full-page-modal">
          <div className="modal">
            <div className="modal-content">
              <div className="co-in">
                <h2>Add Community</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>✖</button>
              </div>
              <label>Community Name:</label>
              <input type="text" name="name" value={newCommunity.name} onChange={handleInputChange} />
              <label>Description:</label>
              <textarea name="description" value={newCommunity.description} onChange={handleInputChange} />
              <div className="modal-buttons">
                <button onClick={handleAddCommunity}>Save</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {joinModal && (
        <div className="full-page-modal">
          <div className="modal2">
            <div className="modal-content2">
              <div className="co-in2">
                <h2>Join {selectedCommunity?.name}</h2>
                <button className="close-btn" onClick={() => setJoinModal(false)}>✖</button>
              </div>
              <label>Your Name:</label>
              <input type="text" name="name" value={userInfo.name} onChange={handleUserInputChange} />
              <label>Your Email:</label>
              <input type="email" name="email" value={userInfo.email} onChange={handleUserInputChange} />
              <div className="modal-buttons">
                <button onClick={handleJoinCommunity}>Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setJoinModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
