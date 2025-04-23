import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api',
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
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

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No token found');
                }

                // Clear existing token
                delete axiosInstance.defaults.headers.common['Authorization'];
                
                const response = await axios.post('http://localhost:5001/api/users/refresh-token', {
                    token: token
                });

                if (response.data?.token) {
                    const newToken = response.data.token;
                    localStorage.setItem('authToken', newToken);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                localStorage.clear(); // Clear all auth data
                window.location.replace('/login');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;