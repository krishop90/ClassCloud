import React, { useState, useEffect } from "react";
import axios from "axios";
import { Speech, Clock4, MapPin, MemoryStick } from "lucide-react";
import "../style/Events.css";
import AddEventModal from "./AddEventModal";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch events from backend, using search if any query is provided
  const fetchEvents = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const url = searchQuery
        ? `http://localhost:5001/api/events/search?title=${encodeURIComponent(searchQuery)}`
        : "http://localhost:5001/api/events";
      axios
        .get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setEvents(res.data))
        .catch((err) => console.error("Error fetching events:", err));
    } else {
      // fallback: load locally if no token
      const savedEvents = JSON.parse(localStorage.getItem("events")) || [];
      setEvents(savedEvents);
    }
  };

  useEffect(() => {
    fetchEvents();
    const savedRegisteredEvents =
      JSON.parse(localStorage.getItem("registeredEvents")) || [];
    setRegisteredEvents(savedRegisteredEvents);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const response = await axios.get("http://localhost:5001/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched profile:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Function to download registration sheet (only accessible to event creator)
  const handleDownload = async (eventId, eventCreator) => {
    const userId = user?._id;
    const creatorId = typeof eventCreator === "object" && eventCreator._id ? eventCreator._id : eventCreator;
    console.log("User ID:", userId);
    console.log("Event Creator ID:", creatorId);

    if (String(userId) !== String(creatorId)) {
      alert("Only the event creator can download the registration sheet.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`http://localhost:5001/api/events/download/${eventId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "registrations.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading registration sheet:", error);
      alert("Error downloading registration sheet.");
    }
  };

  // Function to add a new event via the backend
  const handleAddEvent = async (newEvent) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to create an event.");
      return;
    }
    try {
      // Ensure all required fields are present
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.venue,
        capacity: newEvent.capacity
      };

      const response = await axios.post(
        "http://localhost:5001/api/events/create",
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh the events list after creating a new event
      fetchEvents();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error creating event. Please try again.");
    }
  };

  // Function to handle event registration via the backend
  const handleRegister = async (eventId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to register for an event.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5001/api/events/register/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optionally update registered events in state
      const updatedRegistered = [...registeredEvents, eventId];
      setRegisteredEvents(updatedRegistered);
      localStorage.setItem("registeredEvents", JSON.stringify(updatedRegistered));
      alert("Registration successful!");
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Error registering for event. Please try again.");
    }
  };

  return (
    <div className="events-container">
      <div className="lectures-header">
        <div className="lectures-header2">
          <h1>Events</h1>
          <p>Browse through your available events</p>
        </div>
        <input
          type="text"
          className="search"
          placeholder="Search by event title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="add-evnt-btn">
          <button onClick={() => setIsModalOpen(true)}>+ Add Event</button>
        </div>
      </div>

      {isModalOpen && (
        <AddEventModal onClose={() => setIsModalOpen(false)} onAddEvent={handleAddEvent} />
      )}

      <div className="event-box">
        {events.map((event, index) => {
          const isRegistered = registeredEvents.includes(event._id || event.id);
          // Get current user id from user object (try _id then id)
          const userId = user?._id || user?.id;
          // Check if current user is the creator; event.createdBy could be an object or a string
          const isCreator =
            user &&
            event.createdBy &&
            ((event.createdBy._id && event.createdBy._id === userId) ||
              (typeof event.createdBy === "string" && event.createdBy === userId));

          return (
            <div key={event._id || index} className="event-card">
              <div className="main-card">
                <div className="sidebox">
                  <h2>{new Date(event.date).toLocaleDateString()}</h2>
                  <p>
                    {new Date(event.date).toLocaleString("en-US", {
                      weekday: "short",
                    })}
                  </p>
                </div>
                <div className="event-details2">
                  <h2>{event.title}</h2>
                  <div className="event-meta">
                    <Speech className="event-icon" />
                    <span>{event.createdBy?.username || event.creator}</span>
                    <Clock4 className="event-icon" />
                    <span>{event.time}</span>
                    <MapPin className="event-icon" />
                    <span>{event.venue}</span>
                    <MemoryStick className="event-icon" />
                    <span>{event.capacity}</span>
                  </div>
                  <div className="event-actions">
                    <button onClick={() => handleDownload(event._id, event.createdBy)}>
                      Download File
                    </button>
                    {!isCreator && (
                      <button
                        className={`register-button ${isRegistered ? "registered" : ""}`}
                        onClick={() => handleRegister(event._id || event.id)}
                        disabled={isRegistered}
                      >
                        {isRegistered ? "Registered" : "Register Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Events;
