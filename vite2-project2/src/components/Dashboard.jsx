import { CalendarDays, SquareActivity, ListTodo } from "lucide-react";
import "../style/Dashboard.css";
import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const savedCommunities = localStorage.getItem("communities");
    if (savedCommunities) {
      setCommunities(JSON.parse(savedCommunities));
    }
  }, []);

  // Fetch tasks from localStorage when the component loads
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

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
            {[...Array(3)].map((_, index) => (
              <div key={index} className="event-item">
                <div className="event-details">
                  <strong>Event Name</strong>
                  <div>Date and Time</div>
                  <div>Place</div>
                </div>
                <a href="#" className="more-details">More details</a>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="section recent-activity">
          <div className="re">
            <h3>Recent Activity</h3>
            <SquareActivity className="calendar" />
          </div>
          <div className="event-list">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="event-item">
                <div className="event-details">
                  <strong>Activity Name</strong>
                  <div>Subject</div>
                  <div>Data</div>
                </div>
                  <a href="#" className="more-details">More details</a>
              </div>
            ))}
          </div>
        </div>

        {/* To-Do List Section - Dynamically Loaded */}
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
                    <div>{task.priority}</div>
                  </div>
                  <a href="/todo" className="more-details">More details</a>
                </div>
              ))
            ) : (
              <p>No tasks available</p>
            )}
          </div>
        </div>
      </div>

      {/* Community Cards Section */}
      <div className="community-cards2">
        {communities.length > 0 ? (
          communities.slice(0,5).map((community, index) => (
            <div key={index} className="community-card2">
              <div className="profile-image"></div>
              <h3>{community.name}</h3>
              <p>{community.members} members</p>
              <p>{community.description}</p>
              <button className="join-button">Join Now</button>
            </div>
          ))
        ) : (
          <p>No communities available</p>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
