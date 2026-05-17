import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Attach Bearer token to every outgoing request
apiClient.interceptors.request.use((config) => {
    const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Normalise error shape so components can read err.response consistently
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);
