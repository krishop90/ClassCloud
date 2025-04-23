import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.invalidToken) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;