import React, { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Header.css";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Determine if the user is authenticated
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));

  const toggleDropdown = () => {
    if (isAuthenticated) {
      setShowDropdown((prev) => !prev);
    } else {
      alert("Please login first.");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle delete profile
  const handleDeleteProfile = async () => {
    if (!isAuthenticated) {
      alert("Please login first.");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("authToken");

        const response = await fetch(
          "http://localhost:5001/api/profile/delete-profile",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (response.ok) {
          alert("Your account has been deleted.");
          localStorage.removeItem("authToken");
          navigate("/"); // redirect to signup page or landing page
        } else {
          const data = await response.json();
          alert(data.error || "Error deleting profile.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong, please try again later.");
      }
    }
  };

  // Handle log out
  const handleLogout = () => {
    if (!isAuthenticated) {
      alert("Please login first.");
      return;
    }
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="logo">ClassCloud</div>
      <div className="header-icons" ref={dropdownRef}>
        <div className="icon profile-icon" onClick={toggleDropdown}>
          <User />
        </div>
        {showDropdown && (
          <div className="dropdown-menu">
            <Link
              to="/edit-profile"
              className="dropdown-link"
              onClick={() => {
                if (!isAuthenticated) {
                  alert("Please login first.");
                  return;
                }
                setShowDropdown(false);
              }}
            >
              Edit Profile
            </Link>
            <button
              onClick={() => {
                handleDeleteProfile();
                setShowDropdown(false);
              }}
              className="dropdown-link"
            >
              Delete Profile
            </button>
            <button
              onClick={() => {
                handleLogout();
                setShowDropdown(false);
              }}
              className="dropdown-link"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
