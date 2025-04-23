import { Navigate } from 'react-router-dom';
import { verifyToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Verify token silently
    verifyToken(token).catch(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
    });

    return children;
};

export default ProtectedRoute;