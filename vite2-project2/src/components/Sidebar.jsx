import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  House,
  MonitorPlay,
  CalendarDays,
  NotebookPen,
  Boxes,
  ListCheck,
  Bot,
} from "lucide-react";
import "../style/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));

  // Handler to prevent navigation for unauthenticated users
  const handleLinkClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert("Please login first.");
    }
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li className={location.pathname === "/dashboard" ? "active" : ""}>
            <Link
              to="/dashboard"
              className="icon-link"
              onClick={handleLinkClick}
            >
              <House />
              <span className="icon-name">Home</span>
            </Link>
          </li>
          <li className={location.pathname === "/lectures" ? "active" : ""}>
            <Link
              to="/lectures"
              className="icon-link"
              onClick={handleLinkClick}
            >
              <MonitorPlay />
              <span className="icon-name">Lectures</span>
            </Link>
          </li>
          <li className={location.pathname === "/events" ? "active" : ""}>
            <Link
              to="/events"
              className="icon-link"
              onClick={handleLinkClick}
            >
              <CalendarDays />
              <span className="icon-name">Events</span>
            </Link>
          </li>
          <li className={location.pathname === "/notes" ? "active" : ""}>
            <Link to="/notes" className="icon-link" onClick={handleLinkClick}>
              <NotebookPen />
              <span className="icon-name">Notes</span>
            </Link>
          </li>
          <li className={location.pathname === "/community" ? "active" : ""}>
            <Link
              to="/community"
              className="icon-link"
              onClick={handleLinkClick}
            >
              <Boxes />
              <span className="icon-name">Community</span>
            </Link>
          </li>
          <li className={location.pathname === "/todo" ? "active" : ""}>
            <Link to="/todo" className="icon-link" onClick={handleLinkClick}>
              <ListCheck />
              <span className="icon-name">To-do</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="settings-container">
        <Link
          to="/chat-bot"
          className={`settings icon-link ${location.pathname === "/chat-bot" ? "active" : ""
            }`}
          onClick={handleLinkClick}
        >
          <Bot />
          <span className="icon-name">Chat Bot</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
