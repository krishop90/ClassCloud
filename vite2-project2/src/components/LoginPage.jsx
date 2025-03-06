import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../style/LoginSign.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            setIsLoading(true);
            setError("");

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/login`,
                { email: email.trim(), password },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            if (response.data.success && response.data.token) {
                // Store token and user data
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.user));

                // Clear form
                setEmail("");
                setPassword("");

                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError(
                error.response?.data?.message ||
                "Invalid credentials. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ls-container">
            <h2>Login</h2>
            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} id="loginForm" name="loginForm">
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                />
                <button
                    type="submit"
                    id="loginButton"
                    name="loginButton"
                    disabled={isLoading || !email || !password}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p>Don't have an account? <Link to="/">Sign Up</Link></p>
            <p>
                <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;