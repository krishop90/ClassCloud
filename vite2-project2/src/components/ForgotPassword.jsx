import React, { useState } from 'react';
import axios from 'axios';  // Add this import
import '../style/ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/forgot-password`,
                { email }
            );
            setMessage(res.data.message);
            setIsError(false);
            setEmail('');
        } catch (error) {
            setMessage(error.response?.data?.message || "Something went wrong!");
            setIsError(true);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Forgot Password</h2>
                {message && (
                    <div className={`message ${isError ? 'error-message' : 'success-message'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleForgotPassword} className="forgot-password-form">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send Reset Link</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
