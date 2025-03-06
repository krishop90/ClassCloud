import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import "./App.css";

const App = () => {
  const token = localStorage.getItem("authToken");

  return (
    <div className="app">
      <Header />
      <Sidebar />
      <div className="main">
        <Routes>
          {/* Root route shows Signup Page */}
          <Route path="/" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/lectures"
            element={token ? <Lectures /> : <Navigate to="/login" />}
          />
          <Route
            path="/events"
            element={token ? <Events /> : <Navigate to="/login" />}
          />
          <Route
            path="/notes"
            element={token ? <Notes /> : <Navigate to="/login" />}
          />
          <Route
            path="/community"
            element={token ? <Community /> : <Navigate to="/login" />}
          />
          <Route
            path="/todo"
            element={token ? <TodoList /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-profile"
            element={token ? <EditProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat-bot"
            element={token ? <Chatbot /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat/:communityId"
            element={token ? <Chat /> : <Navigate to="/login" />}
          />


          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
