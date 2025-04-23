import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000, // Increased timeout
    retryDelay: 1000,
    maxRetries: 3
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

// Add retry logic
axiosInstance.interceptors.response.use(response => response, async error => {
    const config = error.config;

    // If error is ECONNRESET and we haven't retried yet
    if (error.code === 'ECONNRESET' && !config._retry && config.retryCount < config.maxRetries) {
        config._retry = true;
        config.retryCount = (config.retryCount || 0) + 1;

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));

        return axiosInstance(config);
    }

    if ((error.response?.status === 401 || error.response?.data?.invalidToken) && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        alert("Session expired. Please log in again.");
        window.location.href = '/login';
        return new Promise(() => { });
    }

    // If it's a connection error, show a user-friendly message
    if (error.code === 'ECONNRESET') {
        alert("Connection issue detected. Please check your internet connection.");
    }

    return Promise.reject(error);
});

export default axiosInstance;