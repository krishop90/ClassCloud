import axiosInstance from '../config/axios';

export const verifyToken = async (token) => {
    try {
        const response = await axiosInstance.post('/users/verify-token');
        return response.data.valid;
    } catch (error) {
        clearAuthData();
        return false;
    }
};

export const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
};