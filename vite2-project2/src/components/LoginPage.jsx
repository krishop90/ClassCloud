import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/LoginSign.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");  // Added error state for handling errors
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send login request
            const response = await axios.post("http://localhost:5001/api/users/login", {
                email,
                password,
            });

            const { token, user } = response.data;

            // Store token in localStorage for session management
            localStorage.setItem("authToken", token);

            // Navigate to the dashboard
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err);
            setError("Invalid credentials. Please try again.");  // Set error message
        }
    };

    return (
        <div className="ls-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}  {/* Display error message */}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/">Sign Up</Link>
            </p>
        </div>
    );
};

export default LoginPage;
