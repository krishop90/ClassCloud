import React, { useEffect, useState, useRef, useCallback } from "react";
import { CalendarDays, SquareActivity, ListTodo } from "lucide-react";
import axiosInstance from "../config/axios";
import { Link, useNavigate } from "react-router-dom";
import "../style/Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    videoRef.current.play();
  };

  const handleMouseLeave = () => {
    videoRef.current.pause();
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get("/events/upcoming");
      setData(response.data);
    } catch (error) {
      // Error handling is now managed by axios interceptor
      if (!error.response?.status === 401) {
        console.error("Non-auth error:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  // Filter out communities that the user has already joined
  const unjoinedCommunities = communities.filter(
    (community) => !joinedCommunities.some((joined) => joined._id === community._id)
  );

  return (
    <div className="dashboard">
      <div className="sections">
        {/* Upcoming Events Section */}
        <div className="section upcoming-events">
          <div className="up">
            <h3>Upcoming Events</h3>
            <CalendarDays className="calendar" />
          </div>
          <div className="event-list">
            {data?.upcomingEvents?.length > 0 ? (
              data.upcomingEvents.slice(0, 3).map((event) => (
                <div key={event._id} className="event-item">
                  <div className="event-details">
                    <strong>{event.title}</strong>
                    <div>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </div>
                    <div>{event.venue}</div>
                  </div>
                  <Link to={`/events`} className="more-details">
                    More details
                  </Link>
                </div>
              ))
            ) : (
              <p>No upcoming events</p>
            )}
            {data?.upcomingEvents?.length > 3 && (
              <Link to="/events" className="view-all-link">
                View all events ({data.upcomingEvents.length})
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="section recent-activity">
          <div className="re">
            <h3>Recent Activity</h3>
            <SquareActivity className="calendar" />
          </div>
          <div className="activity-list">
            {data?.recentActivity?.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-details">
                  <strong>{activity.action}: {activity.title}</strong>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
            {data?.recentActivity?.length === 0 && <p>No recent activity</p>}
          </div>
        </div>

        {/* To-Do List Section */}
        <div className="section to-do-list">
          <div className="to">
            <h3>To-Do List</h3>
            <ListTodo className="calendar" />
          </div>
          <div className="event-list">
            {data?.tasks?.length > 0 ? (
              data.tasks.map((task, index) => (
                <div key={index} className="event-item">
                  <div className="event-details">
                    <strong>{task.name}</strong>
                    <div>Priority: {task.priority}</div>
                  </div>
                  <Link to="/todo" className="more-details">
                    More details
                  </Link>
                </div>
              ))
            ) : (
              <p>No tasks available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;