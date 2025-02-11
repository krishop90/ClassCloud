import React, { useState, useEffect } from "react";
import "../style/EditProfile.css";

const EditProfile = () => {
  // State to hold user data
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // State to track loading status
  const [loading, setLoading] = useState(true);

  // Simulate fetching user data from backend (Replace with your actual API call)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve JWT token from localStorage (or wherever it's stored)
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No token found");
        }

        // Make an API request to fetch user data (replace with actual API endpoint)
        const response = await fetch("http://localhost:5001/api/profile/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        console.log("Fetched User Data:", data); // Debugging step

        // Set user data from response
        setUserData({
          name: data.name, // Corrected field name
          username: data.username,
          email: data.email,
          password: "", // You can leave password empty or not display it for security reasons
          confirmPassword: ""
        });
      } catch (error) {
        console.error("Error fetching user data:", error); // Debugging step
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchUserData();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated User Data:", userData); // Debugging step
    // Handle the form submission (e.g., update user data on backend)
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message while data is being fetched
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              className="input2"
              placeholder="Full Name"
              name="name"
              value={userData.name} // Display name
              onChange={handleChange}
              disabled // Make the field non-editable
            />
            <input
              type="text"
              className="input2"
              placeholder="Username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              disabled // Make the field non-editable
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              className="input2"
              placeholder="Email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              disabled // Make the field non-editable
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              className="input2"
              placeholder="Password"
              name="password"
              value={userData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              className="input2"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="edit-button">Edit</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
