import axiosInstance from '../config/axios';

export const verifyToken = async (token) => {
    try {
        const response = await axiosInstance.get('/users/verify-token', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return Boolean(response.data?.valid);
    } catch (error) {
        clearAuthData();
        return false;
    }
};

export const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
};