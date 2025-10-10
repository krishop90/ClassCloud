import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { verifyToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
    const [isVerified, setIsVerified] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setIsChecking(false);
            setIsVerified(false);
            return;
        }

        let isMounted = true;
        verifyToken(token)
            .then((valid) => {
                if (!isMounted) return;
                setIsVerified(Boolean(valid));
            })
            .catch(() => {
                if (!isMounted) return;
                setIsVerified(false);
            })
            .finally(() => {
                if (!isMounted) return;
                setIsChecking(false);
            });

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (isChecking) {
        return null;
    }

    if (!isVerified) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;