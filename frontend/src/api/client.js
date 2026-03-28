import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('API Base URL:', RAW_URL);

const api = axios.create({
  baseURL: RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL,
});

api.interceptors.request.use(
  (config) => {
    // 1. Ensure /api prefix for all non-absolute URLs
    if (config.url && !config.url.startsWith('http')) {
      // If URL doesn't start with /api, add it
      if (!config.url.startsWith('/api')) {
        config.url = config.url.startsWith('/') ? `/api${config.url}` : `/api/${config.url}`;
      }
    }

    // 2. Attach Authorization token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('Request URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
