import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../style/Community.css";

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });

  // Fetch all communities
  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("/api/community", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunities(response.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("No auth token found");
        return;
      }

      const response = await axios.get("/api/community", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get user ID from token instead of localStorage
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.id;

      // Filter communities where user is a member
      const userComm = response.data.filter(comm =>
        comm.members.includes(userId)
      );
      setUserCommunities(userComm);
    } catch (error) {
      console.error("Error fetching user communities:", error);
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchUserCommunities();
  }, []);

  // Handle community creation
  const handleAddCommunity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      await axios.post("/api/community/create", newCommunity, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewCommunity({ name: "", description: "" });
      fetchCommunities();
      fetchUserCommunities();
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  // Handle join community
  const handleJoinCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      await axios.post(`/api/community/${communityId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh both lists
      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`/api/community/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunities(response.data);
    } catch (error) {
      console.error("Error searching communities:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="community-section">
        <div className="community-header">
          <div className="community-header2">
            <h1>Community</h1>
            <p>Discover and join communities</p>
          </div>
          <input
            type="text"
            className="community-search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="add-community-btn" onClick={() => setShowModal(true)}>
            + Add Community
          </button>
        </div>

        <div className="communities-container">
          {/* Your Communities Section */}
          <div className="your-communities">
            <h2>Your Communities</h2>
            <div className="community-list">
              {userCommunities.map((community) => (
                <div key={community._id} className="community-card">
                  <div className="community-avatar" />
                  <div className="community-info">
                    <h2>{community.name}</h2>
                    <p>{community.members?.length || 0} members</p>
                    <p>{community.description}</p>
                  </div>
                  <div className="community-actions">
                    <Link
                      to={`/chat/${community._id}`}
                      className="chat-btn"
                    >
                      Chat Now
                    </Link>
                  </div>
                </div>
              ))}
              {userCommunities.length === 0 && (
                <p className="no-communities">You haven't joined any communities yet</p>
              )}
            </div>
          </div>

          {/* All Communities Section */}
          <div className="all-communities">
            <h2>All Communities</h2>
            <div className="community-list">
              {communities
                .filter(comm => !userCommunities.some(uc => uc._id === comm._id))
                .map((community) => (
                  <div key={community._id} className="community-card">
                    <div className="community-avatar" />
                    <div className="community-info">
                      <h2>{community.name}</h2>
                      <p>{community.members?.length || 0} members</p>
                      <p>{community.description}</p>
                    </div>
                    <div className="community-actions">
                      <button
                        className="join-btn"
                        onClick={() => handleJoinCommunity(community._id)}
                      >
                        Join Now
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="full-page-modal">
          <div className="modal">
            <div className="modal-content">
              <div className="co-in">
                <h2>Add Community</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>✖</button>
              </div>
              <form onSubmit={handleAddCommunity}>
                <label>Community Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  required
                />
                <label>Description:</label>
                <textarea
                  name="description"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit">Save</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
