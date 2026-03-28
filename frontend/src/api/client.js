import axios from 'axios';

const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({
  baseURL: RAW_URL.replace(/\/$/, ''),
});

api.interceptors.request.use(
  (config) => {
    // 1. Prepend /api if not already there and not an absolute URL
    if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/api')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    // 2. Attach Authorization token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
