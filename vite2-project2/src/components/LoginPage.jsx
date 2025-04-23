import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { verifyToken, clearAuthData } from '../utils/auth';
import "../style/LoginSign.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                const isValid = await verifyToken(token);
                if (!isValid) {
                    clearAuthData();
                    setError("Session expired. Please login again.");
                }
            }
        };
        checkToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            setIsLoading(true);
            setError("");

            const response = await axiosInstance.post('/users/login', {
                email: email.trim(),
                password
            });

            if (response.data?.success && response.data?.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                navigate('/dashboard');
            } else {
                throw new Error(response.data?.message || 'Login failed');
            }
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.response?.data?.message || "Invalid credentials");
            clearAuthData();
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