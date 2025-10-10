import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
    baseURL,
    timeout: 15000
});

let isRedirecting = false;

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(response => response, async error => {
    if ((error.response?.status === 401 || error.response?.data?.invalidToken) && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        return new Promise(() => {});
    }
    return Promise.reject(error);
});

export default axiosInstance;