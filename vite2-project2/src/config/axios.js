import axios from 'axios';

const baseURL = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.replace('/login');
            return new Promise(() => {});
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;