import React, { useState } from 'react';
import axios from 'axios';  // Add this import
import { useParams, useNavigate } from 'react-router-dom';
import '../style/ForgotPassword.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match");
            setIsError(true);
            return;
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/reset-password/${token}`,
                { newPassword }
            );
            setMessage(response.data.message);
            setIsError(false);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Error resetting password");
            setIsError(true);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h2>Reset Password</h2>
                {message && (
                    <div className={`message ${isError ? 'error-message' : 'success-message'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
