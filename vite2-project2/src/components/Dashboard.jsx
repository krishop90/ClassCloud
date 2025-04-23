import React, { useEffect, useState } from "react";
import { CalendarDays, SquareActivity, ListTodo } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../style/Dashboard.css";

const Dashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication required. Please log in.");
          navigate("/login");
          return;
        }

        // Fetch upcoming events
        const eventsResponse = await axios.get("/api/events/upcoming", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);

        // Fetch recent activity
        const activityResponse = await axios.get("/api/activity/recent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentActivity(activityResponse.data);

        // Fetch tasks from localStorage
        const savedTasks = localStorage.getItem("tasks");
        setTasks(savedTasks ? JSON.parse(savedTasks) : []);

        // Fetch all communities
        const communitiesResponse = await axios.get("/api/community", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommunities(Array.isArray(communitiesResponse.data) ? communitiesResponse.data : []);

        // Derive joined communities
        const userId = localStorage.getItem("userId");
        const userJoinedCommunities = communitiesResponse.data.filter((community) =>
          community.members.includes(userId)
        );
        setJoinedCommunities(userJoinedCommunities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

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
            {upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 3).map((event) => (
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
            {upcomingEvents.length > 3 && (
              <Link to="/events" className="view-all-link">
                View all events ({upcomingEvents.length})
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-details">
                    <strong>{activity.action}: {activity.title}</strong>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent activity</p>
            )}
          </div>
        </div>

        {/* To-Do List Section */}
        <div className="section to-do-list">
          <div className="to">
            <h3>To-Do List</h3>
            <ListTodo className="calendar" />
          </div>
          <div className="event-list">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
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