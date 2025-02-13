import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/LoginSign.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5001/api/users/login", {
                email,
                password,
            });
            // Assume response returns { token } (do not store user details in localStorage)
            const token = response.data.token;
            if (!token) {
                setError("Login error: missing token.");
                return;
            }
            localStorage.setItem("authToken", token);
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err);
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="ls-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
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