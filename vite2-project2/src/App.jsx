import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Lectures from "./components/Lectures";
import Events from "./components/Events";
import Notes from "./components/Notes";
import Community from "./components/Community";
import TodoList from "./components/TodoList";
import EditProfile from "./components/EditProfile";
import Chatbot from "./components/Chatbot";
import Chat from "./components/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import "./App.css";

const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("authToken")));

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem("authToken")));
  }, [location]);

  return (
    <div className="app">
      {/* Hide layout on auth pages; show on protected routes */}
      {!(location.pathname === "/" || location.pathname === "/login" || location.pathname.startsWith('/reset-password') || location.pathname === '/forgot-password') && isAuthenticated && (
        <>
          <Header />
          <Sidebar />
        </>
      )}
      <div className="main">
        <Routes>
          {/* Root route shows Signup Page */}
          <Route path="/" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route
            path="/lectures"
            element={<ProtectedRoute><Lectures /></ProtectedRoute>}
          />
          <Route
            path="/events"
            element={<ProtectedRoute><Events /></ProtectedRoute>}
          />
          <Route
            path="/notes"
            element={<ProtectedRoute><Notes /></ProtectedRoute>}
          />
          <Route
            path="/community"
            element={<ProtectedRoute><Community /></ProtectedRoute>}
          />
          <Route
            path="/todo"
            element={<ProtectedRoute><TodoList /></ProtectedRoute>}
          />
          <Route
            path="/edit-profile"
            element={<ProtectedRoute><EditProfile /></ProtectedRoute>}
          />
          <Route
            path="/chat-bot"
            element={<ProtectedRoute><Chatbot /></ProtectedRoute>}
          />
          <Route
            path="/chat/:communityId"
            element={<ProtectedRoute><Chat /></ProtectedRoute>}
          />


          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
